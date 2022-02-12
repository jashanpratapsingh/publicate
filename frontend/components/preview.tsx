import * as React from "react";
import { Component } from "react";

import ArticleCard from "./article-card";
import FeedCard from "./feed-card";

import * as utility from "../lib/utility";
import { Publicate } from "../lib/publicate";
import { FeedInfo, Summary, generateSummaryFromHTML } from "../lib/feed";
import { generateFakeTransactionInfo } from "../lib/transaction";
import { renderMarkdown } from "../lib/markdown";
import { generateFakeStateInfo } from "../lib/feed";

interface Props {
  markdown: string;
  publicate: Publicate;
}

interface State {
  feedInfo: FeedInfo;
}

export default class Preview extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      feedInfo: null
    };
  }

  componentDidMount() {
    this.renderContent();
  }

  private renderContent = async () => {
    const html = renderMarkdown(this.props.markdown);
    const summary = await generateSummaryFromHTML(html, this.props.publicate);
    const userInfo = await this.props.publicate.getUserInfoFromAddress(
      this.props.publicate.accountAddress
    );
    const transactionInfo = generateFakeTransactionInfo();
    const stateInfo = generateFakeStateInfo();

    this.setState({
      feedInfo: {
        summary,
        userInfo,
        transactionInfo,
        stateInfo,
        feedType: "post" // TODO: support differnet feedType.
      }
    });
  };

  render() {
    if (!this.state.feedInfo) {
      return null;
    } else {
      return (
        <div className="preview">
          <FeedCard feedInfo={this.state.feedInfo} publicate={this.props.publicate} />
          {
            // Only render article if it is article
            // this.state.feedInfo.summary.title ? (
            <ArticleCard
              feedInfo={this.state.feedInfo}
              publicate={this.props.publicate}
              hideReplies={true}
            />
            // ) : null
          }
        </div>
      );
    }
  }
}
