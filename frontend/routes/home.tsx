import * as React from "react";

import { Ribbit, UserInfo } from "../lib/ribbit";
import {
  FeedInfo,
  Summary,
  generateSummaryFromHTML,
  generateFeedInfoFromTransactionInfo
} from "../lib/feed";

import { decompressString, checkUserRegistration } from "../lib/utility";
import { renderMarkdown } from "../lib/markdown";

import Footer from "../components/footer";
import Edit from "../components/edit";
import FeedCard from "../components/feed-card";
import ProfileCard from "../components/profile-card";
import AnnouncementCard from "../components/announcement-card";
import TopicsCard from "../components/topics-card";
import FollowingsCard from "../components/followings-card";
import ProfileSettingsCard from "../components/profile-settings-card";
import { userInfo } from "os";

enum HomePanel {
  FollowingsFeeds,
  TopicsFeeds,
  Settings,
  Notifications
}

interface HomeFeedsEntry {
  blockNumber: number;
  creation: number;
  userAddress: string;
}

interface Props {
  ribbit: Ribbit;
  networkId: number;
}
interface State {
  showEditPanel: boolean;
  msg: string;
  homeFeedsEntries: HomeFeedsEntry[]; // starting block numbers
  feeds: FeedInfo[];
  loading: boolean;
  doneLoadingAll: boolean;
  userInfo: UserInfo;
  panel: HomePanel;
  searchBoxValue: string;
}
export default class Home extends React.Component<Props, State> {
  private lastFeedCard: HTMLDivElement;

  constructor(props: Props) {
    super(props);
    this.state = {
      showEditPanel: false,
      msg: "",
      homeFeedsEntries: [],
      feeds: [],
      loading: false,
      doneLoadingAll: false,
      userInfo: null,
      panel: HomePanel.FollowingsFeeds,
      searchBoxValue: ""
    };
  }

  componentDidMount() {
    const ribbit = this.props.ribbit;
    checkUserRegistration(ribbit);
    this.showUserHome(ribbit);
    this.bindWindowScrollEvent();
  }

  componentWillReceiveProps(newProps: Props) {
    if (this.props.ribbit !== newProps.ribbit) {
      checkUserRegistration(newProps.ribbit);
      this.showUserHome(newProps.ribbit);
      this.bindWindowScrollEvent();
    }
  }

  showUserHome(ribbit: Ribbit) {
    if (!ribbit) return;
    ribbit.getUserInfoFromAddress(ribbit.accountAddress).then(userInfo => {
      this.setState(
        {
          userInfo
        },
        async () => {
          // initialize homeFeedsEntries:
          const homeFeedsEntries: HomeFeedsEntry[] = [];
          // TODO: change followingUsernames to followingUsers and store their addresses instead of usernames.
          for (let i = 0; i < ribbit.settings.followingUsernames.length; i++) {
            const username = ribbit.settings.followingUsernames[i].username;
            const userAddress = await ribbit.getAddressFromUsername(username);
            if (userAddress) {
              const blockNumber = parseInt(
                await ribbit.contractInstance.methods
                  .getCurrentFeedInfo(userAddress)
                  .call()
              );
              homeFeedsEntries.push({
                blockNumber,
                creation: Infinity,
                userAddress
              });
            }
          }
          this.setState(
            {
              homeFeedsEntries,
              doneLoadingAll: false
            },
            () => {
              this.showHomeFeeds();
            }
          );
        }
      );
    });
  }

  showHomeFeeds() {
    const homeFeedsEntries = this.state.homeFeedsEntries;
    // console.log("showHomeFeeds", homeFeedsEntries)
    if (!homeFeedsEntries.length) {
      return this.setState({
        loading: false,
        doneLoadingAll: true
      });
    }
    if (this.state.loading) {
      return;
    }
    this.setState(
      {
        loading: true
      },
      async () => {
        let maxBlockNumber = homeFeedsEntries[0].blockNumber;
        let maxCreation = homeFeedsEntries[0].creation;
        let maxUserAddress = homeFeedsEntries[0].userAddress;
        let maxOffset = 0;
        homeFeedsEntries.forEach((homeFeedsEntry, offset) => {
          if (
            homeFeedsEntry.blockNumber > maxBlockNumber ||
            (homeFeedsEntry.blockNumber === maxBlockNumber &&
              homeFeedsEntry.creation > maxCreation)
          ) {
            maxBlockNumber = homeFeedsEntry.blockNumber;
            maxCreation = homeFeedsEntry.creation;
            maxUserAddress = homeFeedsEntry.userAddress;
            maxOffset = offset;
          }
        });

        const transactionInfo = await this.props.ribbit.getTransactionInfo({
          userAddress: maxUserAddress,
          blockNumber: maxBlockNumber
        });

        if (!transactionInfo) {
          homeFeedsEntries.splice(maxOffset, 1); // finish loading all feeds from user.
          return this.setState(
            {
              loading: false
            },
            () => {
              this.scroll();
            }
          );
        } else {
          // TODO: reply
          const eventLog = transactionInfo.decodedLogs.filter(
            x => x.name === "SavePreviousFeedInfoEvent"
          )[0];
          if (!eventLog) {
            console.log("@@@ TODO: Support reply in home feeds.");
          }
          let blockNumber = parseInt(
            eventLog.events["previousFeedInfoBN"].value
          );
          const homeFeedsEntry = homeFeedsEntries[maxOffset];
          homeFeedsEntry.blockNumber = blockNumber;
          homeFeedsEntry.creation = transactionInfo.creation;

          const feedInfo = await generateFeedInfoFromTransactionInfo(
            this.props.ribbit,
            transactionInfo
          );
          const feeds = this.state.feeds;
          feeds.push(feedInfo);
          this.setState(
            {
              feeds,
              homeFeedsEntries
            },
            () => {
              this.setState(
                {
                  loading: false
                },
                () => {
                  // this.showHomeFeeds();
                  this.scroll();
                }
              );
            }
          );
        }
      }
    );
  }

  bindWindowScrollEvent() {
    window.onscroll = this.scroll;
  }

  scroll = () => {
    if (this.state.doneLoadingAll) {
      return;
    } else {
      const scrollTop = document.body.scrollTop;
      const offsetHeight = document.body.offsetHeight;
      const middlePanel = document.querySelector(
        ".middle-panel"
      ) as HTMLDivElement;

      if (middlePanel.offsetHeight < scrollTop + 1.4 * offsetHeight) {
        console.log("scroll loading");
        this.showHomeFeeds();
      }
      console.log("scroll", document.body.offsetTop);
    }
  };

  showUserFeeds(ribbit: Ribbit) {
    if (!ribbit) {
      return;
    }
    this.setState({ loading: true }, () => {
      ribbit.getFeedsFromUser(
        ribbit.accountAddress,
        { num: -1 },
        async (done, offset, transactionInfo) => {
          if (done) {
            return this.setState({ loading: false });
          }
        }
      );
    });
  }

  showNotificationFeeds(ribbit: Ribbit) {
    if (!ribbit) {
      return;
    }
    this.setState({ loading: true }, () => {
      ribbit.getFeedsFromTagByTime(
        ribbit.accountAddress,
        { num: -1 },
        async (done, offset, transactionInfo) => {
          console.log("showNotificationFeeds: ", done, offset, transactionInfo);
          if (done) {
            return this.setState({ loading: false });
          }
          const message = await ribbit.retrieveMessage(
            transactionInfo.decodedInputData.params["message"].value
          );

          const feedType = transactionInfo.decodedInputData.name;

          // console.log(message);
          const summary = await generateSummaryFromHTML(
            renderMarkdown(message),
            this.props.ribbit
          );

          const userInfo = await ribbit.getUserInfoFromAddress(
            transactionInfo.from
          );

          const stateInfo = await ribbit.getFeedStateInfo(transactionInfo.hash);

          const feeds = this.state.feeds;
          feeds.push({
            summary,
            transactionInfo,
            userInfo,
            stateInfo,
            feedType
          });
          this.forceUpdate();
        }
      );
    });
  }

  toggleEditPanel = () => {
    const { showEditPanel } = this.state;
    this.setState({ showEditPanel: !showEditPanel });
  };

  switchPanel = (panel: HomePanel) => {
    return event => {
      this.setState(
        {
          panel,
          feeds: []
        },
        () => {
          if (panel === HomePanel.FollowingsFeeds) {
            this.showUserFeeds(this.props.ribbit);
          } else if (panel === HomePanel.Notifications) {
            this.showNotificationFeeds(this.props.ribbit);
          }
        }
      );
    };
  };

  searchBoxKeydown = async event => {
    const searchValue = this.state.searchBoxValue.trim();
    if (!searchValue.length) {
      return;
    }
    const ribbit = this.props.ribbit;
    if (event.which === 13) {
      // enter key
      if (ribbit.web3.utils.isAddress(searchValue)) {
        // search for user
        const username = await ribbit.getUsernameFromAddress(searchValue);
        if (username && username.length) {
          window.open(
            `${window.location.pathname}#/${
              ribbit.networkId
            }/profile/${username}`,
            "_blank"
          );
        } else {
          alert(`User with address ${searchValue} doesn't exist.`);
        }
      } else if (searchValue.startsWith("@")) {
        // search for user
        window.open(
          `${window.location.pathname}#/${
            ribbit.networkId
          }/profile/${searchValue.slice(1)}`,
          "_blank"
        );
      } else {
        // search for topic
        window.open(
          `${window.location.pathname}#/${
            ribbit.networkId
          }/topic/${encodeURIComponent(searchValue)}`,
          "_blank"
        );
      }
    }
  };

  render() {
    let middlePanel = null;
    if (this.state.panel === HomePanel.FollowingsFeeds) {
      middlePanel = (
        <div className="cards">
          {this.state.feeds.map((feedInfo, index) => (
            <FeedCard
              key={index}
              feedInfo={feedInfo}
              ribbit={this.props.ribbit}
            />
          ))}
          <p id="feed-footer">
            {" "}
            {this.state.loading ? "Loading..." : "No more feeds ;)"}{" "}
          </p>
        </div>
      );
    } else if (this.state.panel === HomePanel.Settings) {
      middlePanel = (
        <div className="settings-panel">
          <ProfileSettingsCard ribbit={this.props.ribbit} />
        </div>
      );
    } else if (this.state.panel === HomePanel.Notifications) {
      middlePanel = (
        <div className="cards">
          {this.state.feeds.map((feedInfo, index) => (
            <FeedCard
              key={index}
              feedInfo={feedInfo}
              ribbit={this.props.ribbit}
            />
          ))}
          <p id="feed-footer">
            {" "}
            {this.state.loading ? "Loading..." : "No more feeds ;)"}{" "}
          </p>
        </div>
      );
    }

    if (this.props.ribbit && this.props.ribbit.accountAddress) {
      const ribbit = this.props.ribbit;
      return (
        <div className="home">
          <div className="left-panel">
            <ProfileCard
              userInfo={this.state.userInfo}
              ribbit={this.props.ribbit}
            />
            <FollowingsCard ribbit={this.props.ribbit} />
          </div>
          <div className="middle-panel">
            <div className="top-bar card">
              <div className="search-box-wrapper">
                <input
                  className="search-box"
                  placeholder={
                    "Enter @username here or the topic that you are interested to start searching"
                  }
                  value={this.state.searchBoxValue}
                  onChange={event => {
                    this.setState({ searchBoxValue: event.target.value });
                  }}
                  onKeyDown={this.searchBoxKeydown}
                />
              </div>
              <div className="icon-groups">
                <i
                  className={
                    "icon fas fa-home" +
                    (this.state.panel === HomePanel.FollowingsFeeds
                      ? " selected"
                      : "")
                  }
                  onClick={this.switchPanel(HomePanel.FollowingsFeeds)}
                />
                <i
                  className={
                    "icon fab fa-slack-hash" +
                    (this.state.panel === HomePanel.TopicsFeeds
                      ? " selected"
                      : "")
                  }
                  onClick={this.switchPanel(HomePanel.TopicsFeeds)}
                />
                <i
                  className={
                    "icon fas fa-bell" +
                    (this.state.panel === HomePanel.Notifications
                      ? " selected"
                      : "")
                  }
                  onClick={this.switchPanel(HomePanel.Notifications)}
                />
                <i
                  className={
                    "icon fas fa-cog" +
                    (this.state.panel === HomePanel.Settings ? " selected" : "")
                  }
                  onClick={this.switchPanel(HomePanel.Settings)}
                />
              </div>
            </div>
            {middlePanel}
          </div>
          <div className="right-panel">
            <div className="post-btn-group">
              <div className="ribbit-btn btn" onClick={this.toggleEditPanel}>
                <i className="fas fa-pen-square" />Ribbit
              </div>
              <a href="https://github.com/shd101wyy/ribbit" target="_blank">
                <div className="github-btn btn">
                  <i className="fab fa-github" />
                </div>
              </a>
              <a
                href="https://github.com/shd101wyy/ribbit/issues"
                target="_blank"
              >
                <div className="bug-btn github-btn btn">
                  <i className="fas fa-bug" />
                </div>
              </a>
              <a href="https://ethgasstation.info/" target="_blank">
                <div className="github-btn btn">
                  <i className="fas fa-fire" />
                </div>
              </a>
            </div>
            {/* <AnnouncementCard /> */}
            <TopicsCard ribbit={this.props.ribbit} />
          </div>
          {this.state.showEditPanel ? (
            <Edit cancel={this.toggleEditPanel} ribbit={this.props.ribbit} />
          ) : null}
        </div>
      );
    } else {
      return (
        <div className="home">
          <h1 className="title is-1">
            Please make sure{" "}
            <a href="https://metamask.io/" target="_blank">
              MetaMask
            </a>{" "}
            is working in your browser.
          </h1>
        </div>
      );
    }
  }
}
