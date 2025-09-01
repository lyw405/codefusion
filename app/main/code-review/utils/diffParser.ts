import { ParsedFileDiff, ParsedDiffLine, DiffChunk } from "../types/diff"

/**
 * 解析 Git patch 格式的差异数据
 * 参考 GitHub 的实现方式
 */
export class DiffParser {
  /**
   * 解析单个文件的差异
   */
  static parseFileDiff(
    filename: string,
    patch: string,
    status: string,
  ): ParsedFileDiff {
    const lines = patch.split("\n")
    const chunks: DiffChunk[] = []
    let currentChunk: DiffChunk | null = null
    let additions = 0
    let deletions = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // 解析 chunk header (例如: @@ -1,3 +1,4 @@)
      if (line.startsWith("@@")) {
        if (currentChunk) {
          chunks.push(currentChunk)
        }

        const chunkInfo = this.parseChunkHeader(line)
        currentChunk = {
          header: line,
          oldStart: chunkInfo.oldStart,
          oldLines: chunkInfo.oldLines,
          newStart: chunkInfo.newStart,
          newLines: chunkInfo.newLines,
          lines: [],
        }
        continue
      }

      if (currentChunk) {
        const parsedLine = this.parseDiffLine(line, currentChunk)
        currentChunk.lines.push(parsedLine)

        if (parsedLine.type === "addition") additions++
        if (parsedLine.type === "deletion") deletions++
      }
    }

    // 添加最后一个 chunk
    if (currentChunk) {
      chunks.push(currentChunk)
    }

    return {
      filename,
      status: status as "added" | "modified" | "removed" | "renamed",
      additions,
      deletions,
      chunks,
      rawPatch: patch,
    }
  }

  /**
   * 解析 chunk header
   * 格式: @@ -oldStart,oldLines +newStart,newLines @@
   */
  private static parseChunkHeader(header: string): {
    oldStart: number
    oldLines: number
    newStart: number
    newLines: number
  } {
    const match = header.match(/^@@ -(\d+),?(\d+)? \+(\d+),?(\d+)? @@/)
    if (!match) {
      throw new Error(`Invalid chunk header: ${header}`)
    }

    return {
      oldStart: parseInt(match[1]),
      oldLines: parseInt(match[2] || "1"),
      newStart: parseInt(match[3]),
      newLines: parseInt(match[4] || "1"),
    }
  }

  /**
   * 解析差异行
   */
  private static parseDiffLine(line: string, chunk: DiffChunk): ParsedDiffLine {
    let type: ParsedDiffLine["type"] = "context"
    let content = line
    const lineNumber: { old?: number; new?: number } = {}

    if (line.startsWith("+")) {
      type = "addition"
      content = line.substring(1)
      lineNumber.new =
        chunk.newStart +
        chunk.lines.filter(l => l.type === "addition" || l.type === "context")
          .length
    } else if (line.startsWith("-")) {
      type = "deletion"
      content = line.substring(1)
      lineNumber.old =
        chunk.oldStart +
        chunk.lines.filter(l => l.type === "deletion" || l.type === "context")
          .length
    } else if (line.startsWith(" ")) {
      type = "context"
      content = line.substring(1)
      lineNumber.old =
        chunk.oldStart +
        chunk.lines.filter(l => l.type === "deletion" || l.type === "context")
          .length
      lineNumber.new =
        chunk.newStart +
        chunk.lines.filter(l => l.type === "addition" || l.type === "context")
          .length
    }

    return {
      type,
      content,
      lineNumber: Object.keys(lineNumber).length > 0 ? lineNumber : undefined,
    }
  }

  /**
   * 解析多个文件的差异
   */
  static parseMultiFileDiff(
    diffData: { filename: string; patch: string; status: string }[],
  ): ParsedFileDiff[] {
    return diffData.map(file =>
      this.parseFileDiff(file.filename, file.patch, file.status),
    )
  }

  /**
   * 生成行号映射
   */
  static generateLineNumberMap(
    chunks: DiffChunk[],
  ): Map<number, { old?: number; new?: number }> {
    const lineMap = new Map<number, { old?: number; new?: number }>()
    let globalLineNumber = 0

    chunks.forEach(chunk => {
      chunk.lines.forEach(line => {
        if (line.lineNumber) {
          lineMap.set(globalLineNumber, line.lineNumber)
        }
        globalLineNumber++
      })
    })

    return lineMap
  }

  /**
   * 计算差异统计
   */
  static calculateStats(fileDiffs: ParsedFileDiff[]): {
    totalFiles: number
    totalAdditions: number
    totalDeletions: number
    totalChanges: number
  } {
    return fileDiffs.reduce(
      (stats, file) => ({
        totalFiles: stats.totalFiles + 1,
        totalAdditions: stats.totalAdditions + file.additions,
        totalDeletions: stats.totalDeletions + file.deletions,
        totalChanges: stats.totalChanges + file.additions + file.deletions,
      }),
      {
        totalFiles: 0,
        totalAdditions: 0,
        totalDeletions: 0,
        totalChanges: 0,
      },
    )
  }
}

/**
 * 模拟 GitHub API 响应数据
 */
export const mockGitHubDiffData = {
  files: [
    {
      filename: "src/auth/auth.controller.ts",
      status: "modified",
      additions: 45,
      deletions: 12,
      changes: 57,
      patch: `@@ -1,3 +1,4 @@
 import { Controller, Post, Body, UseGuards } from '@nestjs/common';
+import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
 import { AuthService } from './auth.service';
 import { LoginDto } from './dto/login.dto';
 
@@ -10,6 +11,7 @@ export class AuthController {
   @Post('login')
-  @ApiOperation({ summary: '用户登录' })
+  @ApiResponse({ status: 200, description: '登录成功' })
   async login(@Body() loginDto: LoginDto) {
     return this.authService.login(loginDto);
   }
@@ -20,6 +22,7 @@ export class AuthController {
   @Post('register')
+  @ApiOperation({ summary: '用户注册' })
+  @ApiResponse({ status: 201, description: '注册成功' })
   async register(@Body() registerDto: RegisterDto) {
     return this.authService.register(registerDto);
   }
@@ -30,6 +33,7 @@ export class AuthController {
   @Post('refresh')
+  @ApiOperation({ summary: '刷新令牌' })
+  @ApiResponse({ status: 200, description: '刷新成功' })
   async refresh(@Body() refreshDto: RefreshDto) {
     return this.authService.refresh(refreshDto);
   }`,
    },
    {
      filename: "src/auth/auth.service.ts",
      status: "modified",
      additions: 67,
      deletions: 8,
      changes: 75,
      patch: `@@ -1,5 +1,6 @@
 import { Injectable, UnauthorizedException } from '@nestjs/common';
 import { JwtService } from '@nestjs/jwt';
+import { ConfigService } from '@nestjs/config';
 import { UsersService } from '../users/users.service';
 import { LoginDto } from './dto/login.dto';
 
@@ -8,6 +9,7 @@ export class AuthService {
   constructor(
     private usersService: UsersService,
     private jwtService: JwtService,
+    private configService: ConfigService,
   ) {}
 
   async login(loginDto: LoginDto) {
@@ -15,6 +17,7 @@ export class AuthService {
     const user = await this.usersService.findByEmail(loginDto.email);
     if (!user || !(await this.validatePassword(loginDto.password, user.password))) {
       throw new UnauthorizedException('Invalid credentials');
+      // 添加日志记录
     }
 
     return this.generateTokens(user);
@@ -25,6 +28,7 @@ export class AuthService {
     const hashedPassword = await this.hashPassword(registerDto.password);
     const user = await this.usersService.create({
       ...registerDto,
+      password: hashedPassword,
     });
 
     return this.generateTokens(user);
@@ -35,6 +39,7 @@ export class AuthService {
     const payload = { sub: user.id, email: user.email };
     return {
       access_token: this.jwtService.sign(payload),
+      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
     };
   }`,
    },
    {
      filename: "src/utils/logger.ts",
      status: "modified",
      additions: 15,
      deletions: 25,
      changes: 40,
      patch: `@@ -1,25 +1,15 @@
-import { createLogger, format, transports } from 'winston';
-import * as DailyRotateFile from 'winston-daily-rotate-file';
-
-const logFormat = format.combine(
-  format.timestamp(),
-  format.errors({ stack: true }),
-  format.json()
-);
-
-const logger = createLogger({
-  level: process.env.LOG_LEVEL || 'info',
-  format: logFormat,
-  transports: [
-    new transports.Console({
-      format: format.combine(format.colorize(), format.simple())
-    }),
-    new DailyRotateFile({
-      filename: 'logs/app-%DATE%.log',
-      datePattern: 'YYYY-MM-DD',
-      maxSize: '20m',
-      maxFiles: '14d'
-    })
-  ]
-});
+import { Logger } from '@nestjs/common';
+
+export class AppLogger extends Logger {
+  constructor(context?: string) {
+    super(context);
+  }
+
+  log(message: string, context?: string) {
+    super.log(message, context);
+  }
+}
 
-export default logger;
+export const logger = new AppLogger();
`,
    },
    {
      filename: "src/config/database.ts",
      status: "modified",
      additions: 8,
      deletions: 12,
      changes: 20,
      patch: `@@ -1,12 +1,8 @@
-import { TypeOrmModuleOptions } from '@nestjs/typeorm';
-import { ConfigService } from '@nestjs/config';
-
-export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
-  type: 'postgres',
-  host: configService.get('DB_HOST'),
-  port: configService.get('DB_PORT'),
-  username: configService.get('DB_USERNAME'),
-  password: configService.get('DB_PASSWORD'),
-  database: configService.get('DB_NAME'),
-  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
-  synchronize: configService.get('NODE_ENV') === 'development',
-});
+import { TypeOrmModuleOptions } from '@nestjs/typeorm';
+
+export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
+  type: 'sqlite',
+  database: 'app.db',
+  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
+  synchronize: true,
+});
`,
    },
    {
      filename: "src/auth/dto/login.dto.ts",
      status: "added",
      additions: 23,
      deletions: 0,
      changes: 23,
      patch: `@@ -0,0 +1,23 @@
+import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
+import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
+
+export class LoginDto {
+  @ApiProperty({
+    description: '用户邮箱',
+    example: 'user@example.com',
+    type: String
+  })
+  @IsEmail({}, { message: '请输入有效的邮箱地址' })
+  email: string;
+
+  @ApiProperty({
+    description: '用户密码',
+    example: 'password123',
+    minLength: 6,
+    maxLength: 50,
+    type: String
+  })
+  @IsString({ message: '密码必须是字符串' })
+  @MinLength(6, { message: '密码长度不能少于6位' })
+  @MaxLength(50, { message: '密码长度不能超过50位' })
+  password: string;
+
+  @ApiPropertyOptional({
+    description: '记住登录状态',
+    example: false,
+    type: Boolean
+  })
+  @IsOptional()
+  rememberMe?: boolean;
+}`,
    },
    {
      filename: "src/middleware/error-handler.ts",
      status: "deleted",
      additions: 0,
      deletions: 35,
      changes: 35,
      patch: `@@ -1,35 +0,0 @@
-import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
-import { Observable, throwError } from 'rxjs';
-import { map, catchError } from 'rxjs/operators';
-
-@Injectable()
-export class ErrorHandlerInterceptor implements NestInterceptor {
-  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
-    return next.handle().pipe(
-      map(data => ({
-        success: true,
-        data,
-        timestamp: new Date().toISOString()
-      })),
-      catchError(error => {
-        const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
-        const message = error.message || 'Internal server error';
-        
-        return throwError(() => new HttpException({
-          success: false,
-          error: message,
-          timestamp: new Date().toISOString()
-        }, status));
-      })
-    );
-  }
-}
-
-export default ErrorHandlerInterceptor;
`,
    },
    {
      filename: "src/utils/legacy-helper.ts",
      status: "deleted",
      additions: 0,
      deletions: 42,
      changes: 42,
      patch: `@@ -1,42 +0,0 @@
-/**
- * 遗留的辅助函数文件
- * 由于重构，这些函数已被新的工具类替代
- */
-
-import { Logger } from '@nestjs/common';
-
-export class LegacyHelper {
-  private static logger = new Logger('LegacyHelper');
-
-  /**
-   * 格式化日期字符串
-   * @deprecated 使用 DateUtils.formatDate() 替代
-   */
-  static formatDate(date: Date): string {
-    this.logger.warn('LegacyHelper.formatDate() 已被弃用，请使用 DateUtils.formatDate()');
-    return date.toISOString().split('T')[0];
-  }
-
-  /**
-   * 验证邮箱格式
-   * @deprecated 使用 ValidationUtils.isValidEmail() 替代
-   */
-  static isValidEmail(email: string): boolean {
-    this.logger.warn('LegacyHelper.isValidEmail() 已被弃用，请使用 ValidationUtils.isValidEmail()');
-    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
-    return emailRegex.test(email);
-  }
-
-  /**
-   * 生成随机字符串
-   * @deprecated 使用 CryptoUtils.generateRandomString() 替代
-   */
-  static generateRandomString(length: number = 8): string {
-    this.logger.warn('LegacyHelper.generateRandomString() 已被弃用，请使用 CryptoUtils.generateRandomString()');
-    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
-    let result = '';
-    for (let i = 0; i < length; i++) {
-      result += chars.charAt(Math.floor(Math.random() * chars.length));
-    }
-    return result;
-  }
-}
-
-export default LegacyHelper;
`,
    },
  ],
}
