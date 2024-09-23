'use client';

import { ADJUSTMENT_OBJECT, INITIAL_BOARDS, INITIAL_STATE } from '@/constants';
import AppReducer, { EAppAction } from '@/reducer/app';
import { EMove, EResult, TResults } from '@/types';
import { deepCopy, setLocalStorage } from '@/utils';
import { ReactNode, useCallback, useMemo, useReducer, useRef } from 'react';

export default function Home() {
	const [state, dispatch] = useReducer(AppReducer, INITIAL_STATE);
	const { isComputer, isFirstPlayer, isGameOver, boards, scores } = state;

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const MAX_SYMBOL = useMemo(() => boards.length, []);
	const boardFilledCtr = useRef<number>(0);

	const calculateGameStatus = (results: TResults, isComputer: boolean) => {
		let isWin: boolean = false;
		for (let key in results) {
			if (results[key as EResult] === MAX_SYMBOL - 1) {
				isWin = true;
			}
		}

		const isComputerWin = isComputer && isWin;
		const isFirstPlayerWin = !isComputer && isFirstPlayer && isWin;
		const isSecondPlayerWin = !isFirstPlayer && isWin;
		const isTie: boolean =
			!isComputerWin &&
			!isFirstPlayerWin &&
			!isSecondPlayerWin &&
			boardFilledCtr.current === MAX_SYMBOL * MAX_SYMBOL;
		const isGameOver: boolean =
			isFirstPlayerWin || isSecondPlayerWin || isComputerWin || isTie;

		if (isGameOver) {
			scores.firstPlayer = isFirstPlayerWin
				? scores.firstPlayer + 1
				: scores.firstPlayer;
			scores.secondPlayer = isSecondPlayerWin
				? scores.secondPlayer + 1
				: scores.secondPlayer;
			scores.tie = isTie ? scores.tie + 1 : scores.tie;
			scores.computer = isComputerWin ? scores.computer + 1 : scores.computer;

			boardFilledCtr.current = 0;
			dispatch({ type: EAppAction.SET_GAME_OVER, payload: isGameOver });
			dispatch({ type: EAppAction.SET_SCORES, payload: scores });
			dispatch({ type: EAppAction.SET_PLAYER, payload: true });
			setLocalStorage(scores);
		}
	};
	const getLines = (
		rowIdx: number,
		colIdx: number,
		symbol: string,
		updatedBoards: string[][],
		initialRes: TResults,
		move?: EMove
	): TResults => {
		if (
			rowIdx < 0 ||
			colIdx < 0 ||
			rowIdx > updatedBoards.length - 1 ||
			colIdx > updatedBoards[rowIdx].length - 1
		) {
			return initialRes;
		}
		if (!updatedBoards[rowIdx][colIdx]) {
			return initialRes;
		}
		if (updatedBoards[rowIdx][colIdx] !== symbol) {
			return initialRes;
		}

		if (!move) {
			for (let key in ADJUSTMENT_OBJECT) {
				initialRes = getLines(
					rowIdx + ADJUSTMENT_OBJECT[key as EMove].row,
					colIdx + ADJUSTMENT_OBJECT[key as EMove].col,
					symbol,
					updatedBoards,
					initialRes,
					key as EMove
				);
			}
		} else {
			initialRes = getLines(
				rowIdx + ADJUSTMENT_OBJECT[move].row,
				colIdx + ADJUSTMENT_OBJECT[move].col,
				symbol,
				updatedBoards,
				initialRes,
				move
			);

			if (move === EMove.LEFT || move === EMove.RIGHT) {
				initialRes[EResult.HORIZONTAL] = initialRes[EResult.HORIZONTAL] + 1;
			} else if (move === EMove.BOTTOM || move === EMove.TOP) {
				initialRes[EResult.VERTICAL] = initialRes[EResult.VERTICAL] + 1;
			} else if (
				move === EMove.DIAGONAL_BOTTOM_LEFT ||
				move === EMove.DIAGONAL_TOP_RIGHT
			) {
				initialRes[EResult.DIAGONAL_LEFT] =
					initialRes[EResult.DIAGONAL_LEFT] + 1;
			} else if (
				move === EMove.DIAGONAL_BOTTOM_RIGHT ||
				move === EMove.DIAGONAL_TOP_LEFT
			) {
				initialRes[EResult.DIAGONAL_RIGHT] =
					initialRes[EResult.DIAGONAL_RIGHT] + 1;
			}
		}
		return initialRes;
	};

	const AiBestMove = useCallback(
		(
			boards: string[][],
			rowIdx: number,
			colIdx: number,
			isComputer: boolean
		) => {
			const isTie = (boards: string[][]) => {
				for (let i = 0; i < boards.length; i++) {
					for (let j = 0; j < boards[i].length; j++) {
						if (!boards[i][j]) {
							return false;
						}
					}
				}
				return true;
			};
			const getWinner = (
				boards: string[][],
				rowIdx: number,
				colIdx: number
			): boolean => {
				const initialRes: TResults = {
					[EResult.HORIZONTAL]: 0,
					[EResult.VERTICAL]: 0,
					[EResult.DIAGONAL_LEFT]: 0,
					[EResult.DIAGONAL_RIGHT]: 0,
				};
				const result = getLines(
					rowIdx,
					colIdx,
					boards[rowIdx][colIdx],
					boards,
					initialRes
				);

				let isWin: boolean = false;
				for (let key in result) {
					if (result[key as EResult] === MAX_SYMBOL - 1) {
						isWin = true;
					}
				}
				return isWin;
			};

			const miniMax = (
				boards: string[][],
				rowIdx: number,
				colIdx: number,
				isMax: boolean,
				depth?: number
			) => {
				const player = isMax ? 'O' : 'X';
				const isWin = getWinner(boards, rowIdx, colIdx);
				const best = {
					score: isMax ? -Infinity : Infinity,
					i: rowIdx,
					j: colIdx,
				};
				const nextDepth = depth ? depth - 1 : undefined;

				if (player === 'X' && isWin) {
					return { score: 1, i: rowIdx, j: colIdx };
				}
				if (player === 'O' && isWin) {
					return { score: -1, i: rowIdx, j: colIdx };
				}
				if (isTie(boards)) {
					return { score: 0, i: rowIdx, j: colIdx };
				}
				if (depth === 0) {
					return best;
				}

				for (let i = 0; i < boards.length; i++) {
					for (let j = 0; j < boards[i].length; j++) {
						if (boards[i][j]) {
							continue;
						}

						boards[i][j] = player;
						const score = miniMax(
							deepCopy(boards),
							i,
							j,
							!isMax,
							nextDepth
						).score;
						boards[i][j] = '';

						if (isMax) {
							if (score > best.score) {
								best.score = score;
								best.i = i;
								best.j = j;
							}
						} else {
							if (score < best.score) {
								best.score = score;
								best.i = i;
								best.j = j;
							}
						}
					}
				}
				return best;
			};

			const depth = MAX_SYMBOL > 3 ? 3 : undefined;
			return miniMax(deepCopy(boards), rowIdx, colIdx, isComputer, depth);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		},
		[]
	);

	const clickBoard = (rowIdx: number, colIdx: number) => {
		const newBoards = deepCopy(boards);
		if (isGameOver) {
			return;
		}
		if (newBoards[rowIdx][colIdx]) {
			return;
		}

		const initialRes: TResults = {
			[EResult.HORIZONTAL]: 0,
			[EResult.VERTICAL]: 0,
			[EResult.DIAGONAL_LEFT]: 0,
			[EResult.DIAGONAL_RIGHT]: 0,
		};

		if (isComputer) {
			newBoards[rowIdx][colIdx] = 'X';
			const { i, j } = AiBestMove(newBoards, rowIdx, colIdx, true);

			if (i !== rowIdx || j !== colIdx) {
				newBoards[i][j] = 'O';
				boardFilledCtr.current = boardFilledCtr.current + 1;
				const result = getLines(i, j, newBoards[i][j], newBoards, {
					...initialRes,
				});
				calculateGameStatus(result, isComputer);
			}
		} else {
			if (isFirstPlayer) {
				newBoards[rowIdx][colIdx] = 'X';
			} else {
				newBoards[rowIdx][colIdx] = 'O';
			}
			dispatch({ type: EAppAction.SET_PLAYER, payload: !isFirstPlayer });
		}

		dispatch({ type: EAppAction.SET_BOARDS, payload: newBoards });

		boardFilledCtr.current = boardFilledCtr.current + 1;
		const result = getLines(
			rowIdx,
			colIdx,
			newBoards[rowIdx][colIdx],
			newBoards,
			{ ...initialRes }
		);
		calculateGameStatus(result, false);
	};

	const generateCell = useCallback(
		(row: Array<string>, rowIdx: number): ReactNode => {
			return row.map((cell, idx) => {
				let content: ReactNode;
				if (cell === 'X') {
					content = (
						<img
							src='/images/close.png'
							width='32'
							height='32'
							alt='cross-icon'
						></img>
					);
				} else if (cell === 'O') {
					content = (
						<img
							src='/images/circle.png'
							width='32'
							height='32'
							alt='circle-icon'
						></img>
					);
				} else if (cell === '') {
					content = null;
				}

				return (
					<div className='cell' key={`cell-${rowIdx}-${idx}`}>
						<button
							type='button'
							onClick={() => clickBoard(rowIdx, idx)}
							disabled={isGameOver}
						>
							<span>{content}</span>
						</button>
					</div>
				);
			});
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[isGameOver, boards]
	);
	const generateBoard = useCallback((): ReactNode => {
		return boards.map((row, idx) => {
			return (
				<div className='row' key={`row-${idx}`}>
					{generateCell(row, idx)}
				</div>
			);
		});
	}, [boards, generateCell]);

	return (
		<div className='App'>
			<div className='container'>
				{generateBoard()}
				<div className='row'>
					<div className='block-info'>
						<h4>Player 1 (X)</h4>
						<p>{state.scores.firstPlayer}</p>
					</div>
					<div className='block-info'>
						<h4>Tie</h4>
						<p>{state.scores.tie}</p>
					</div>
					<div className='block-info'>
						<h4>{state.isComputer ? 'Computer (O)' : 'Player 2 (O)'}</h4>
						<p>
							{state.isComputer
								? state.scores.computer
								: state.scores.secondPlayer}
						</p>
					</div>
				</div>
				<div className='row'>
					<button
						type='button'
						className='reset-button'
						disabled={!state.isGameOver}
						onClick={() => {
							dispatch({
								type: EAppAction.SET_BOARDS,
								payload: INITIAL_BOARDS,
							});
							dispatch({ type: EAppAction.SET_GAME_OVER, payload: false });
						}}
					>
						Reset
					</button>
					<button
						type='button'
						className='play-computer'
						disabled={!state.isGameOver}
						onClick={() => {
							dispatch({
								type: EAppAction.SET_IS_COMPUTER,
								payload: !state.isComputer,
							});
						}}
					>
						Play with {isComputer ? '2nd Player' : 'Computer'}
					</button>
				</div>
			</div>
		</div>
	);
}
