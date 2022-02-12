import * as React from "react";

import ArticleCard from "../components/article-card";
import Header from "../components/header";

import { Publicate } from "../lib/publicate";
import { checkNetworkId } from "../lib/utility";
import { TransactionInfo } from "../lib/transaction";
import hashHistory from "../lib/history";
import {
  generateSummaryFromHTML,
  FeedInfo,
  generateFeedInfoFromTransactionInfo
} from "../lib/feed";
import { renderMarkdown } from "../lib/markdown";

interface Props {
  publicate: Publicate;
  networkId: number;
  transactionHash: string;
}

interface State {
  msg: string;
  feedInfo: FeedInfo;
}

export default class Tx extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      msg: `Loading ${this.props.transactionHash}...`,
      feedInfo: null
    };
  }

  componentDidMount() {
    document.body.scrollTop = 0;
    checkNetworkId(this.props.publicate, this.props.networkId);
    this.analyzeTransaction(
      this.props.transactionHash,
      this.props.networkId,
      this.props.publicate
    );
  }

  componentWillReceiveProps(newProps: Props) {
    if (
      newProps.transactionHash !== this.props.transactionHash ||
      newProps.networkId !== this.props.networkId
    ) {
      document.body.scrollTop = 0;
      checkNetworkId(newProps.publicate, newProps.networkId);
      this.analyzeTransaction(
        newProps.transactionHash,
        newProps.networkId,
        newProps.publicate
      );
    }
  }

  async analyzeTransaction(
    transactionHash: string,
    networkId: number,
    publicate: Publicate
  ) {
    try {
      const transaction = await publicate.web3.eth.getTransaction(transactionHash);
      const decodedInputData = publicate.decodeMethod(transaction.input);
      if (!decodedInputData || Object.keys(decodedInputData).length === 0) {
        this.setState({
          msg: `Invalid transaction ${transactionHash}`
        });
      } else {
        let transactionInfo = Object.assign(transaction as object, {
          decodedInputData
        }) as TransactionInfo;
        try {
          const feedInfo = await generateFeedInfoFromTransactionInfo(
            publicate,
            transactionInfo
          );
          if (feedInfo) {
            this.setState({ feedInfo });
          }
        } catch (error) {
          console.log(error);
          this.setState({
            msg: `Invalid transaction ${transactionHash}`
          });
        }
      }
    } catch (error) {
      console.log(error);
      this.setState({
        msg: `Invalid transaction ${transactionHash}`
      });
    }
  }

  render() {
    if (!this.state.feedInfo) {
      return (
        <div className="tx-page">
          <Header publicate={this.props.publicate} />
          <div className="container">
            <p id="feed-footer">{this.state.msg}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="tx-page">
        <Header publicate={this.props.publicate} showBackBtn={true} />
        <div className="container">
          <ArticleCard
            publicate={this.props.publicate}
            feedInfo={this.state.feedInfo}
          />
        </div>
      </div>
    );
  }
}
