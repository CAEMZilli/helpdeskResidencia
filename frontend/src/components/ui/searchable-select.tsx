import * as React from "react"
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "@/components/ui/combobox"

export interface SearchableSelectOption {
  value: string
  label: string
  group?: string
}

interface SearchableSelectGroup {
  label: string
  items: SearchableSelectOption[]
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value?: string
  onChange: (value: string | undefined) => void
  placeholder?: string
  emptyText?: string
  disabled?: boolean
  id?: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Buscar...",
  emptyText = "Sin resultados.",
  disabled,
  id,
}: SearchableSelectProps) {
  const hasGroups = options.some((o) => o.group)

  const items = React.useMemo<SearchableSelectOption[] | SearchableSelectGroup[]>(() => {
    if (!hasGroups) return options
    const groups = new Map<string, SearchableSelectOption[]>()
    for (const opt of options) {
      const key = opt.group ?? ""
      const list = groups.get(key) ?? []
      list.push(opt)
      groups.set(key, list)
    }
    return Array.from(groups.entries()).map(([label, groupItems]) => ({ label, items: groupItems }))
  }, [options, hasGroups])

  const selected = options.find((o) => o.value === value) ?? null

  return (
    <Combobox<SearchableSelectOption>
      items={items}
      value={selected}
      onValueChange={(item) => onChange(item ? item.value : undefined)}
      disabled={disabled}
    >
      <ComboboxInput id={id} placeholder={placeholder} showClear />
      <ComboboxContent>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {hasGroups
            ? ((group: SearchableSelectGroup) => (
                <ComboboxGroup key={group.label} items={group.items}>
                  <ComboboxLabel>{group.label}</ComboboxLabel>
                  <ComboboxCollection>
                    {(item: SearchableSelectOption) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                </ComboboxGroup>
              ))
            : ((item: SearchableSelectOption) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
