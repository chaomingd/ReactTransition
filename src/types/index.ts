import { MutableRefObject } from 'react';

export type Nullable<T> = T | null | undefined;
export type RefTarget<T> = T | null | undefined | MutableRefObject<T | null | undefined>;