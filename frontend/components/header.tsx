import * as React from "react";
import { Component } from "react";
import { Link } from "react-router-dom";
import { I18n } from "react-i18next";

import { Publicate } from "../lib/publicate";
import hashHistory from "../lib/history";
import i18n from "../i18n/i18n";

export enum Page {
  HomePage,
  TopicsPage,
  NotificationsPage,
  SettingsPage
}

interface Props {
  publicate: Publicate;
  page?: Page;
  showBackBtn?: boolean;
}

interface State {
  searchBoxValue: string;
}

export default class Header extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchBoxValue: ""
    };
  }

  searchBoxKeydown = async event => {
    const searchValue = this.state.searchBoxValue.trim();
    if (!searchValue.length) {
      return;
    }
    const publicate = this.props.publicate;
    if (event.which === 13) {
      // enter key
      if (publicate.web3.utils.isAddress(searchValue)) {
        // search for user
        const username = await publicate.getUsernameFromAddress(searchValue);
        if (username && username.length) {
          window.open(
            `${window.location.pathname}#/${
              publicate.networkId
            }/profile/${username}`,
            "_blank"
          );
        } else {
          new window["Noty"]({
            type: "error",
            text: i18n.t("notification/user-address-doesnt-exist", {
              userAddress: searchValue
            }),
            timeout: 10000
          }).show();
        }
      } else if (searchValue.startsWith("@")) {
        // search for user
        window.open(
          `${window.location.pathname}#/${
            publicate.networkId
          }/profile/${searchValue.slice(1)}`,
          "_blank"
        );
      } else {
        // search for topic
        window.open(
          `${window.location.pathname}#/${
            publicate.networkId
          }/topic/${encodeURIComponent(searchValue)}`,
          "_blank"
        );
      }
    }
  };

  render() {
    return (
      <I18n>
        {(t, { i18n }) => (
          <header className="header">
            <div className="wrapper">
              {this.props.showBackBtn ? (
                <h1 className="back-btn" onClick={() => hashHistory.goBack()}>
                  &nbsp;
                  <i className="fas fa-chevron-left" />
                  &nbsp;
                </h1>
              ) : (
                <h1
                  onClick={() =>
                    hashHistory.replace(`/${this.props.publicate.networkId}/`)
                  }
                >
                  Publicate{" "}
                  <span className="network-name" style={{ fontSize: "0.6em" }}>
                    ({this.props.publicate.networkNameAbbrev})
                  </span>
                </h1>
              )}
              <nav>
                <Link
                  className={
                    "header-tab " +
                    (this.props.page === Page.HomePage ? "selected" : "")
                  }
                  to={`/${this.props.publicate.networkId}/`}
                >
                  <i className="icon fas fa-home" />
                  <span>{t("components/header/home")}</span>
                </Link>
                <Link
                  className={
                    "header-tab " +
                    (this.props.page === Page.TopicsPage ? "selected" : "")
                  }
                  to={`/${this.props.publicate.networkId}/topics`}
                >
                  <i className="icon fas fa-hashtag" />
                  <span>{t("components/header/topics")}</span>
                </Link>
                <Link
                  className={
                    "header-tab " +
                    (this.props.page === Page.NotificationsPage
                      ? "selected"
                      : "")
                  }
                  to={`/${this.props.publicate.networkId}/notifications`}
                >
                  <i className="icon fas fa-bell" />
                  <span>{t("components/header/notifications")}</span>
                </Link>
                <Link
                  className={
                    "header-tab " +
                    (this.props.page === Page.SettingsPage ? "selected" : "")
                  }
                  to={`/${this.props.publicate.networkId}/settings`}
                >
                  <i className="icon fas fa-cog" />
                  <span>{t("components/header/settings")}</span>
                </Link>
              </nav>
              <div className="search-box-wrapper">
                <input
                  className="search-box"
                  placeholder={t("components/header/search-box-placeholder")}
                  value={this.state.searchBoxValue}
                  onChange={event => {
                    this.setState({ searchBoxValue: event.target.value });
                  }}
                  onKeyDown={this.searchBoxKeydown}
                />
              </div>
            </div>
          </header>
        )}
      </I18n>
    );
  }
}
