#!/bin/bash

# Codefusion 部署脚本
# 参考 bone 项目的实现方式

BasePath=$(cd `dirname $0`; pwd)
ProjectDir=/tmp/codefusion/projects

# 部署参数
Project=$1
Branch=$2
Host=$3
Port=$4
User=$5
Password=$6
Environment=$7

# 检查参数
if [ -z "$Project" ] || [ -z "$Branch" ] || [ -z "$Host" ] || [ -z "$User" ]; then
  echo "Usage: $0 <project> <branch> <host> <port> <user> <password> <environment>"
  exit 1
fi

# 设置默认端口
Port=${Port:-22}

echo "开始部署项目: $Project"
echo "分支: $Branch"
echo "目标服务器: $User@$Host:$Port"
echo "环境: $Environment"

# 创建临时目录
mkdir -p $ProjectDir
cd $ProjectDir

# 克隆或更新项目
if [ -d "$Project" ]; then
  echo "更新项目代码..."
  cd $Project
  git fetch origin
  git checkout $Branch
  git pull origin $Branch
else
  echo "克隆项目代码..."
  git clone -b $Branch https://github.com/$Project.git
  cd $Project
fi

# 获取最新提交ID
CommitId=$(git rev-parse HEAD)
echo "部署提交: $CommitId"

# 检测项目类型并执行构建
echo "检测项目类型..."
if [ -f "package.json" ]; then
  echo "检测到 Node.js 项目"
  
  # 安装依赖
  echo "安装依赖..."
  if [ -f "yarn.lock" ]; then
    yarn install --production=false
  else
    npm install
  fi
  
  # 执行构建
  echo "执行构建..."
  if [ -f "package.json" ] && grep -q '"build"' package.json; then
    npm run build
  elif [ -f "package.json" ] && grep -q '"build"' package.json; then
    yarn build
  else
    echo "未找到构建脚本，跳过构建"
  fi
  
  # 检查构建结果
  if [ -d "dist" ]; then
    echo "构建成功，生成 dist 目录"
    BuildPath="dist"
  elif [ -d "build" ]; then
    echo "构建成功，生成 build 目录"
    BuildPath="build"
  else
    echo "构建失败，未找到输出目录"
    exit 1
  fi
else
  echo "未检测到 Node.js 项目，尝试其他构建方式..."
  
  # 检查是否有自定义构建脚本
  if [ -f "build.sh" ]; then
    echo "执行自定义构建脚本..."
    chmod +x build.sh
    ./build.sh
  elif [ -f "Makefile" ]; then
    echo "执行 Makefile 构建..."
    make
  else
    echo "未找到构建方式，跳过构建"
    BuildPath="."
  fi
fi

# 创建部署包
echo "创建部署包..."
DeployPackage="$Project-$CommitId.tar.gz"
tar czf $DeployPackage $BuildPath

# 部署到服务器
echo "部署到服务器..."
if [ -n "$Password" ]; then
  # 使用密码部署
  sshpass -p "$Password" scp -P $Port -o StrictHostKeyChecking=no $DeployPackage $User@$Host:/tmp/
  sshpass -p "$Password" ssh -p $Port -o StrictHostKeyChecking=no $User@$Host << EOF
    cd /tmp
    tar xzf $DeployPackage
    # 这里可以添加部署后的配置脚本
    echo "部署完成: $Project"
EOF
else
  # 使用SSH密钥部署
  scp -P $Port -o StrictHostKeyChecking=no $DeployPackage $User@$Host:/tmp/
  ssh -p $Port -o StrictHostKeyChecking=no $User@$Host << EOF
    cd /tmp
    tar xzf $DeployPackage
    # 这里可以添加部署后的配置脚本
    echo "部署完成: $Project"
EOF
fi

# 清理临时文件
echo "清理临时文件..."
rm -f $DeployPackage
cd $BasePath
rm -rf $ProjectDir

echo "部署完成: $Project -> $User@$Host:$Port"
exit 0
