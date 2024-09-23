import { IStorageScore } from "../types";
import { deepCopy } from "../utils";

export enum EAppAction {
  SET_BOARDS = 'SET_BOARDS',
  SET_PLAYER = 'SET_PLAYER',
  SET_GAME_OVER = 'SET_GAME_OVER',
  SET_SCORES = 'SET_SCORES',
  SET_IS_COMPUTER = 'SET_IS_COMPUTER',
}

export interface IAppAction {
  type: EAppAction;
  payload: 
    | IAppState['boards']
    | IAppState['isFirstPlayer']
    | IAppState['isGameOver']
    | IAppState['scores']
    | IAppState['isComputer'];
}
export interface IAppState {
  boards: Array<Array<string>>;
  isFirstPlayer: boolean;
  isComputer: boolean;
  isGameOver: boolean;
  scores: IStorageScore;
}

const AppReducer = (state: IAppState, action: IAppAction) => {
  switch(action.type) {
    case EAppAction.SET_BOARDS:
      const boards = action.payload as IAppState['boards'];
      const newBoards = deepCopy(boards);
      return {
        ...state,
        boards: newBoards,
      }
    case EAppAction.SET_PLAYER:
      return {
        ...state,
        isFirstPlayer: action.payload as IAppState['isFirstPlayer'],
      }
    case EAppAction.SET_GAME_OVER:
      return {
        ...state,
        isGameOver: action.payload as IAppState['isGameOver'],
      }
    case EAppAction.SET_SCORES:
      return {
        ...state,
        scores: action.payload as IAppState['scores'],
      }
    case EAppAction.SET_IS_COMPUTER:
      return {
        ...state,
        isComputer: action.payload as IAppState['isComputer'],
      }
    default: 
      return state;
  }
}

export default AppReducer;