import merge from 'deepmerge'

export default function<T>(dest: unknown, source: unknown, opts?: merge.Options): T {
  if (source == null) return dest as T
  return merge(dest, source, opts ?? {
    arrayMerge: (dest, source) => source
  }) as T
}
