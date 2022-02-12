/**
 * /:networkId/topic/:topic
 */
import * as React from "react";
import { I18n } from "react-i18next";
import { Publicate, UserInfo } from "../lib/publicate";
import {
  FeedInfo,
  generateSummaryFromHTML,
  generateFeedInfoFromTransactionInfo
} from "../lib/feed";
import { checkNetworkId } from "../lib/utility";
import { renderMarkdown } from "../lib/markdown";
import FeedCard from "../components/feed-card";
import ProfileCard from "../components/profile-card";
import Header from "../components/header";
import TopicFeedCards from "../components/topic-feed-cards";
import { TransactionInfo } from "../lib/transaction";

interface Props {
  publicate: Publicate;
  networkId: number;
  topic: string;
}
interface State {
  cover: string;
  following: boolean;
  mouseOver: boolean;
}

export default class profile extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      cover: null,
      following: true,
      mouseOver: false
    };
  }

  componentDidMount() {
    checkNetworkId(this.props.publicate, this.props.networkId);
    this.initializeTopic(this.props.topic);
  }

  componentWillReceiveProps(newProps: Props) {
    // if (newProps.topic !== this.props.topic) {
    checkNetworkId(newProps.publicate, newProps.networkId);
    this.initializeTopic(newProps.topic);
    // }
  }

  async initializeTopic(topic: string) {
    // check following or not
    const followingTopics = this.props.publicate.settings.followingTopics;
    const following = !!followingTopics.filter(x => x.topic === topic).length;
    this.setState({
      following
    });

    // update cover
    const publicate = this.props.publicate;
    const formattedTag = publicate.formatTag(topic);
    const blockNumber = parseInt(
      await publicate.contractInstance.methods
        .getCurrentTagInfoByTrend(formattedTag)
        .call()
    );
    if (blockNumber) {
      const transactionInfo = await publicate.getTransactionInfo({
        tag: formattedTag,
        maxCreation: Date.now(),
        blockNumber
      });
      if (transactionInfo) {
        const authorAddress = transactionInfo.from;
        const userInfo = await publicate.getUserInfoFromAddress(authorAddress);
        if (userInfo) {
          this.setState({
            cover: userInfo.cover
          });
        }
      }
    }
  }

  followTopic = () => {
    this.props.publicate
      .followTopic(this.props.topic)
      .then(() => {
        this.setState({
          following: true
        });
      })
      .catch(error => {
        new window["Noty"]({
          type: "error",
          text: error,
          timeout: 10000
        }).show();
      });
  };

  unfollowTopic = () => {
    this.props.publicate
      .unfollowTopic(this.props.topic)
      .then(() => {
        this.setState({
          following: false
        });
      })
      .catch(error => {
        new window["Noty"]({
          type: "error",
          text: error,
          timeout: 10000
        }).show();
      });
  };

  render() {
    /**
     * Prevent from loading user address as topic.
     */
    if (this.props.publicate.web3.utils.isAddress(this.props.topic)) {
      return (
        <I18n>
          {(t, { i18n }) => (
            <div className="topic-page">
              <p id="feed-footer">
                {t("general/invalid-topic")} {this.props.topic}
              </p>
            </div>
          )}
        </I18n>
      );
    }
    return (
      <I18n>
        {(t, { i18n }) => (
          <div className="topic-page">
            <Header publicate={this.props.publicate} />
            <div className="container">
              <div className="topic-card card">
                <div
                  className="cover"
                  style={{
                    backgroundImage: this.state.cover
                      ? `url("${this.state.cover}")`
                      : null
                  }}
                />
                <p className="title">#{this.props.topic}</p>
                {this.state.following ? (
                  this.state.mouseOver ? (
                    <div
                      className="follow-btn"
                      onMouseEnter={() => this.setState({ mouseOver: true })}
                      onMouseLeave={() => this.setState({ mouseOver: false })}
                      onClick={this.unfollowTopic}
                    >
                      {t("general/unfollow")}
                    </div>
                  ) : (
                    <div
                      className="follow-btn"
                      onMouseEnter={() => this.setState({ mouseOver: true })}
                      onMouseLeave={() => this.setState({ mouseOver: false })}
                    >
                      {t("general/following")}
                    </div>
                  )
                ) : (
                  <div className="follow-btn" onClick={this.followTopic}>
                    {t("general/follow")}
                  </div>
                )}
              </div>
              <TopicFeedCards
                publicate={this.props.publicate}
                topic={this.props.topic}
              />
            </div>
          </div>
        )}
      </I18n>
    );
  }
}
