import * as React from "react";

import Edit from "../components/edit";
import DonatePanel from "../components/donate-panel";
import SharePanel from "../components/share-panel";

import { FeedInfo } from "../lib/feed";
import { Publicate } from "../lib/publicate";
import i18n from "../i18n/i18n";

interface Props {
  feedInfo: FeedInfo;
  publicate: Publicate;
}
interface State {
  showEditPanel: boolean;
  showDonatePanel: boolean;
  showSharePanel: boolean;
  earnings: number; // in US dollars
}

export default class ActionsBottomPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showEditPanel: false,
      showDonatePanel: false,
      showSharePanel: false,
      earnings: 0
    };
  }

  /*
  upvote = event => {
    event.preventDefault();
    event.stopPropagation();
    this.props.publicate
      .upvote(this.props.feedInfo.transactionInfo.hash)
      .then(hash => {
        // do nothing.
      })
      .catch(error => {
        alert(error);
      });
  };
  */

  componentDidMount() {
    this.updateFeedEarnings(this.props.feedInfo);
  }

  componentWillReceiveProps(newProps: Props) {
    if (
      newProps.feedInfo.transactionInfo.hash !==
      this.props.feedInfo.transactionInfo.hash
    ) {
      this.updateFeedEarnings(newProps.feedInfo);
    }
  }

  updateFeedEarnings(feedInfo: FeedInfo) {
    if (feedInfo.stateInfo.earnings) {
      fetch("https://api.coinmarketcap.com/v1/ticker/ethereum/")
        .then(x => x.json())
        .then(([data]) => {
          const priceUSD = parseFloat(data["price_usd"]);
          if (priceUSD > 0) {
            this.setState({
              earnings:
                feedInfo.stateInfo.earnings / 1000000000000000000 * priceUSD
            });
          }
        });
    } else {
      this.setState({
        earnings: 0
      });
    }
  }

  downvote = event => {
    event.preventDefault();
    event.stopPropagation();
    this.props.publicate
      .downvote(this.props.feedInfo.transactionInfo.hash)
      .then(hash => {
        // do nothing
        new window["Noty"]({
          type: "info",
          text: i18n.t("notification/publish-downvote"),
          timeout: 10000
        }).show();
      })
      .catch(error => {
        new window["Noty"]({
          type: "error",
          text: JSON.stringify(error),
          timeout: 10000
        }).show();
      });
  };

  reply = event => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      showEditPanel: true
    });
  };

  toggleDonatePanel = event => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ showDonatePanel: true });
  };

  toggleSharePanel = event => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ showSharePanel: true });
  };

  render() {
    const summary = this.props.feedInfo.summary;
    const transactionInfo = this.props.feedInfo.transactionInfo;
    const userInfo = this.props.feedInfo.userInfo;
    const stateInfo = this.props.feedInfo.stateInfo;
    const repostUserInfo = this.props.feedInfo.repostUserInfo;
    const feedType = this.props.feedInfo.feedType;

    if (!transactionInfo || !transactionInfo.hash) {
      return null;
    }

    if (this.state.showEditPanel) {
      return (
        <Edit
          cancel={() => {
            this.setState({ showEditPanel: false });
          }}
          publicate={this.props.publicate}
          parentFeedInfo={this.props.feedInfo} // <= TODO: for reply, this parentFeedInfo is wrong.
        />
      );
    }

    return (
      <div className="actions-bottom-panel">
        <div className="left-btn-group">
          <div className="upvote-btn btn" onClick={this.toggleDonatePanel}>
            <i className="fas fa-caret-up">
              {stateInfo.upvotes ? (
                <span className="upvote-num">{stateInfo.upvotes}</span>
              ) : null}
            </i>
          </div>
          <div className="downvote-btn btn" onClick={this.downvote}>
            <i className="fas fa-caret-down" />
            {/* <span className="downvote-num">{stateInfo.downvotes || ""}</span> */}
          </div>
          <div className="reply-btn btn" onClick={this.reply}>
            <i className="far fa-comment" />
            <span className="comment-num">{stateInfo.replies || ""}</span>
          </div>
        </div>
        <div className="right-btn-group">
          <div className="share-btn btn" onClick={this.toggleSharePanel}>
            <i className="fas fa-share-alt" />
          </div>
          {this.state.earnings ? (
            <div className="earnings">
              <i className="fas fa-dollar-sign" />
              {this.state.earnings.toFixed(2)}
            </div>
          ) : null}
        </div>
        {/*
        <div className="donate-btn btn" onClick={this.donate}>
          <i className="fas fa-dollar-sign" />
          <span className="comment-num">{stateInfo.earnings || ""}</span>
        </div>
        */}
        {this.state.showDonatePanel ? (
          <DonatePanel
            close={() => this.setState({ showDonatePanel: false })}
            feedInfo={this.props.feedInfo}
            publicate={this.props.publicate}
          />
        ) : null}
        {this.state.showSharePanel ? (
          <SharePanel
            close={() => this.setState({ showSharePanel: false })}
            networkId={this.props.publicate.networkId}
            transactionHash={this.props.feedInfo.transactionInfo.hash}
          />
        ) : null}
      </div>
    );
  }
}
