import * as React from "react";
import { Component } from "react";
import { BigNumber } from "bignumber.js";

import UserTopPanel from "./user-top-panel";
import ActionsBottomPanel from "./actions-bottom-panel";
import FeedCard from "./feed-card";

import * as utility from "../lib/utility";
import { FeedInfo, generateFeedInfoFromTransactionInfo } from "../lib/feed";
import { Publicate } from "../lib/publicate";

import TopicFeedCards from "../components/topic-feed-cards";

interface Props {
  feedInfo: FeedInfo;
  publicate: Publicate;
  hideActionsPanel?: boolean;
  hideReplies?: boolean;
}

interface State {
  parent: FeedInfo;
}

export default class ArticleCard extends Component<Props, State> {
  private elem: HTMLDivElement;
  constructor(props: Props) {
    super(props);

    this.state = {
      parent: null
    };
  }

  componentDidMount() {
    this.addTargetBlankToAnchorElements();
    this.loadParent(this.props.feedInfo);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.feedInfo.transactionInfo.hash !==
      this.props.feedInfo.transactionInfo.hash
    ) {
      // reset state
      this.setState(
        {
          parent: null
        },
        () => {
          this.loadParent(nextProps.feedInfo);
        }
      );
    }
  }

  componentDidUpdate() {
    this.addTargetBlankToAnchorElements();
  }

  async loadParent(feedInfo: FeedInfo) {
    if (
      !feedInfo ||
      feedInfo.transactionInfo.decodedInputData.name !== "reply"
    ) {
      return;
    }
    const originTransactionHash = feedInfo.transactionInfo.hash;
    const parentTransactionHash =
      feedInfo.transactionInfo.decodedInputData.params["parentTransactionHash"]
        .value;
    try {
      const transactionInfo = await this.props.publicate.getTransactionInfo({
        transactionHash: parentTransactionHash
      });
      const feedInfo = await generateFeedInfoFromTransactionInfo(
        this.props.publicate,
        transactionInfo
      );

      if (feedInfo) {
        this.setState({ parent: feedInfo });
      }
    } catch (error) {
      console.log(error);
    }
  }

  addTargetBlankToAnchorElements() {
    if (!this.elem) {
      return;
    }
    const anchorElements = this.elem.getElementsByTagName("A");
    for (let i = 0; i < anchorElements.length; i++) {
      const anchorElement = anchorElements[i];
      anchorElement.setAttribute("target", "_blank");
    }
  }

  render() {
    const feedInfo = this.props.feedInfo;
    return (
      <div className="article-panel">
        <div className="parent">
          {this.state.parent ? (
            <FeedCard
              publicate={this.props.publicate}
              feedInfo={this.state.parent}
              hideParent={true}
            />
          ) : this.props.feedInfo.transactionInfo.decodedInputData.name ===
          "reply" ? (
            <div className="card">Loading parent...</div>
          ) : null}
        </div>
        <div className="article-card card">
          <UserTopPanel publicate={this.props.publicate} feedInfo={feedInfo} />
          <div
            className="content"
            ref={elem => {
              this.elem = elem;
            }}
            dangerouslySetInnerHTML={{ __html: feedInfo.summary.html }}
          />
          {this.props.hideActionsPanel ? null : (
            <ActionsBottomPanel
              publicate={this.props.publicate}
              feedInfo={feedInfo}
            />
          )}
        </div>
        {this.props.hideReplies ? null : (
          <div className="replies">
            <TopicFeedCards
              areReplies={true}
              publicate={this.props.publicate}
              topic={this.props.feedInfo.transactionInfo.hash}
            />
          </div>
        )}
      </div>
    );
  }
}
