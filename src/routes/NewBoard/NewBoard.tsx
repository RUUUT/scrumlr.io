import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';

import { Boards } from '../../types';
import { mapStateToProps } from './NewBoard.container';
import './NewBoard.scss';
import { AuthProvider } from '../../constants/Auth';
import getRandomName from '../../constants/Name';
import ProviderLogin from '../../components/ProviderLogin/ProviderLogin';
import Input from '../../components/Input/Input';
import WelcomeArea from '../../components/WelcomeArea/WelcomeArea';
import { RetroMode } from '../../constants/mode';
import StartButton from '../../components/StartButton';
import AccessModeSelection, {
  AccessMode
} from '../../components/AccessModeSelection';
import { authConfig } from '../../config';
import TextBlock from './TextBlock';

export type OwnNewBoardProps = RouteComponentProps<{}>;

export interface StateNewBoardProps {
  uid: string | null;
  boards: Boards;
  onLogin: (name: string, mode: RetroMode, secure: boolean) => void;
  onProviderLogin: (provider: AuthProvider) => () => void;
  onLogout: () => void;
  onCreateNewBoard: (mode: RetroMode, secure: boolean) => void;
  isAnonymous: boolean;
}

export type NewBoardProps = OwnNewBoardProps & StateNewBoardProps;

export interface NewBoardState {
  email: string;
  secure: boolean;
  error: boolean;
}

export class NewBoard extends Component<NewBoardProps, NewBoardState> {
  defaultName: string;

  constructor(props: NewBoardProps) {
    super(props);

    this.defaultName = getRandomName();
    this.state = { email: this.defaultName, secure: false, error: false };
  }

  handleChangeEmail = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const email = (e.target as HTMLInputElement).value;
    this.setState(state => ({ ...state, email, error: /^\s/.test(email) }));
  };

  handleClickLogin = (mode: RetroMode) => {
    if (!this.state.error) {
      this.props.onLogin(this.state.email, mode, this.state.secure);
    }
  };

  handleChangeMode = (mode: AccessMode) => {
    this.setState({ secure: mode === 'private' });
  };

  render() {
    const { uid, isAnonymous } = this.props;

    const SecureBoardCheckbox = (
      <AccessModeSelection
        mode={this.state.secure ? 'private' : 'public'}
        onChange={this.handleChangeMode}
        className="new-board__access-mode-selection"
      />
    );

    return (
      <WelcomeArea>
        {!uid && authConfig.allowAnonymousBoards && (
          <div className="new-board__action-area-content">
            <TextBlock header="Try it now!" />
            <div>
              <Input
                type="text"
                label="Your name"
                placeholder={this.defaultName}
                focusTheme="mint"
                description="Choose a name by which you will be recognized"
                error={
                  this.state.error
                    ? 'Your name may not start with a whitespace'
                    : undefined
                }
                className="new-board__input"
                onChange={this.handleChangeEmail}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.keyCode === 13) {
                    this.handleClickLogin('lean');
                  }
                }}
              />
            </div>
            <div>
              {SecureBoardCheckbox}
              <StartButton
                onStart={(mode: RetroMode) => this.handleClickLogin(mode)}
              />
              <ProviderLogin onProviderLogin={this.props.onProviderLogin} />
            </div>
          </div>
        )}
        {!uid && !authConfig.allowAnonymousBoards && (
          <div className="new-board__action-area-content">
            <TextBlock header="Login first">
              You need to login before you can start your first collaborative
              session.
            </TextBlock>
            <ProviderLogin onProviderLogin={this.props.onProviderLogin} />
          </div>
        )}
        {((uid && authConfig.allowAnonymousBoards) ||
          (uid && !authConfig.allowAnonymousBoards && !isAnonymous)) && (
          <div className="new-board__action-area-content">
            <TextBlock header="Try it now!">
              Start your first online retrospective in a few seconds. No
              registration required - completely free.
            </TextBlock>
            {SecureBoardCheckbox}
            <StartButton
              onStart={(mode: RetroMode) =>
                this.props.onCreateNewBoard(mode, this.state.secure)
              }
            />
            <button
              className="new-board__logout-btn"
              onClick={this.props.onLogout}
            >
              Log out
            </button>
          </div>
        )}
        {uid && !authConfig.allowAnonymousBoards && isAnonymous && (
          <div className="new-board__action-area-content">
            <TextBlock header="Sorry!">
              As an anonymous user you don't have the permission to create your
              own session. Please login with another authentication provider.
            </TextBlock>
            <button
              className="new-board__logout-btn"
              onClick={this.props.onLogout}
            >
              Log out
            </button>
          </div>
        )}
      </WelcomeArea>
    );
  }
}

export default connect(mapStateToProps)(NewBoard);
