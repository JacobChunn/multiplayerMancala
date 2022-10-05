// The proportions of the board relative to the canvas size
const BOARD_WIDTH_PROP = 3.0 / 5.0;
const BOARD_HEIGHT_PROP = 1.0;

// The offsets of the board relative to the canvas size
const BOARD_HORIZONTAL_OFFSET = 1.0 / 5.0;
const BOARD_VERTICAL_OFFSET = 0.0;

// The proportions of the score_pile and pit placements
const SCORE_PILE_VERTICAL_PROP = 1.0 / 8.0;
const SCORE_PILE_HORIZONTAL_PROP = 1.0;
const PIT_VERTICAL_PROP = 1.0 - 2 * (SCORE_PILE_VERTICAL_PROP);
const PIT_HORIZONTAL_PROP = 1.0;
const PIT_GAP = 0.2; // The additional gap between the columns of pits

// The proportions of the pits and score_piles themselves
const PIT_RAD = 50;

export {
	BOARD_WIDTH_PROP,
	BOARD_HEIGHT_PROP,
	BOARD_HORIZONTAL_OFFSET,
	BOARD_VERTICAL_OFFSET,
	SCORE_PILE_VERTICAL_PROP,
	SCORE_PILE_HORIZONTAL_PROP,
	PIT_VERTICAL_PROP,
	PIT_HORIZONTAL_PROP,
	PIT_GAP,
	PIT_RAD
};