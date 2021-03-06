import { BoardCards, BoardConfig, StoreState } from '../../types';
import { OwnColumnViewProps, StateColumnViewProps } from './ColumnView';
import { getVal } from 'react-redux-firebase';
import { getPhaseConfiguration } from '../../constants/Retrospective';

export const mapStateToProps = (
  state: StoreState,
  ownProps: OwnColumnViewProps
): StateColumnViewProps => {
  const boardConfig: BoardConfig = getVal(
    state.fbState,
    `data/${ownProps.boardUrl}/config`,
    {}
  );

  let filteredCardType: string | undefined = undefined;
  const focusedCardId = boardConfig.focusedCardId;
  if (focusedCardId) {
    const boardCards: BoardCards = getVal(
      state.fbState,
      `data/${ownProps.boardUrl}/cards`,
      {}
    );

    const focusedCard = boardCards[focusedCardId];
    filteredCardType = focusedCard.type;
  }

  return {
    phase: getPhaseConfiguration(boardConfig.mode, boardConfig.guidedPhase),
    filteredCardType
  };
};
