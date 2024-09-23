import { LOCAL_STORAGE_KEY } from "../constants";
import { IStorageScore } from "../types";

export const setLocalStorage = (storage: IStorageScore) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storage));
}

export function deepCopy(array: string[][] | number[][] | boolean[][]) {
  let copy: any[][] = [];
  array.forEach((elem: any) => {
    if (Array.isArray(elem)) {
      copy.push(deepCopy(elem));
    } else {
      copy.push(elem)
    }
  });
  return copy;
}