import { isObject } from "@chakra-ui/shared-utils"
import { tokenToCssVar } from "./token-to-css-var"

export function createColorPalettesCssVars(
  tokens: Record<string, any>,
  cssVarPrefix?: string,
) {
  const keys = new Set<string>()
  walkObject(tokens.colors, (value, path) => {
    if (path.length <= 1) {
      return
    }
    const prev = path[path.length - 1]
    keys.add(prev)
  })

  const colorPalette = [...keys].reduce((previousValue, currentValue) => {
    previousValue[currentValue] = tokenToCssVar(
      `colorPalette.${currentValue}`,
      cssVarPrefix,
    ).reference
    return previousValue
  }, {} as Record<string, string>)

  return { colorPalette }
}

export type WalkObjectPredicate<Leaf = unknown> = (
  value: unknown,
  path: string[],
) => Leaf

export type MappedLeavesObject<Obj, LeafType> = {
  [Prop in keyof Obj]: Obj[Prop] extends Array<any>
    ? MappedLeavesObject<Obj[Prop][number], LeafType>[]
    : Obj[Prop] extends object
    ? MappedLeavesObject<Obj[Prop], LeafType>
    : LeafType
}

export function walkObject<Target, LeafType>(
  target: Target,
  predicate: WalkObjectPredicate<LeafType>,
): MappedLeavesObject<Target, ReturnType<WalkObjectPredicate<LeafType>>> {
  function inner(value: unknown, path: string[] = []): any {
    if (Array.isArray(value)) {
      return value.map((item, index) => inner(item, [...path, String(index)]))
    }

    if (isObject(value)) {
      return Object.fromEntries(
        Object.entries(value).map(([key, child]) => [
          key,
          inner(child, [...path, key]),
        ]),
      )
    }

    return predicate(value, path)
  }

  return inner(target)
}
