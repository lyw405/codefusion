"use client"

import { useState, useCallback } from "react"
import RunScript, { RunScriptOption } from "./index"

export default function useRunScript(defaultOption?: RunScriptOption) {
  const [visible, setVisible] = useState(false)
  const [currentOption, setCurrentOption] = useState<RunScriptOption | null>(null)

  const show = useCallback((option?: RunScriptOption) => {
    if (option) {
      setCurrentOption(option)
    } else if (defaultOption) {
      setCurrentOption(defaultOption)
    }
    setVisible(true)
  }, [defaultOption])

  const hide = useCallback(() => {
    setVisible(false)
    setCurrentOption(null)
  }, [])

  const RunScriptModal = () => {
    if (!currentOption) return null

    return (
      <RunScript
        {...currentOption}
        visible={visible}
        onCancel={hide}
      />
    )
  }

  return {
    show,
    hide,
    RunScriptModal
  }
}
