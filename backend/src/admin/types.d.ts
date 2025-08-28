// Minimal JSX and module type shims to satisfy admin customization TS in this workspace
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any
  }
}

declare module "@medusajs/ui" {
  export const Container: any
  export const Heading: any
  export const Text: any
  export const Badge: any
  export const Button: any
  export function createDataTableColumnHelper<T>(): any
  export const DataTable: any
  export type DataTablePaginationState = any
  export function useDataTable(...args: any[]): any
}


