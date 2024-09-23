import { IAppState } from "../reducer/app";
import { EMove, IStorageScore } from "../types";
import { deepCopy } from "../utils";

export const ADJUSTMENT_OBJECT: Record<EMove, {row: number, col: number}> = {
  [EMove.LEFT]: {row: 0, col: -1},
  [EMove.RIGHT]: {row: 0, col: 1},
  [EMove.TOP]: {row: -1, col: 0},
  [EMove.BOTTOM]: {row: 1, col: 0},
  [EMove.DIAGONAL_BOTTOM_LEFT]: {row: 1, col: -1},
  [EMove.DIAGONAL_BOTTOM_RIGHT]: {row: 1, col: 1},
  [EMove.DIAGONAL_TOP_LEFT]: {row: -1, col: -1},
  [EMove.DIAGONAL_TOP_RIGHT]: {row: -1, col: 1},
}
export const LOCAL_STORAGE_KEY = 'tic-tac-toe';

export const SCORES = (() => {
  if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
    return {
      firstPlayer: 0,
      secondPlayer: 0,
      tie: 0,
      computer: 0,
    } as IStorageScore
  }
 return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}') as IStorageScore;
})();

export const INITIAL_BOARDS: IAppState['boards'] = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];
export const INITIAL_STATE: IAppState = {
  boards: deepCopy(INITIAL_BOARDS),
  isFirstPlayer: true,
  isComputer: true,
  isGameOver: false,
  scores: SCORES
}