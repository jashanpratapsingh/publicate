import * as React from "react";
import { I18n } from "react-i18next";
import { Publicate } from "../lib/publicate";
import hashHistory from "../lib/history";
import { checkNetworkId } from "../lib/utility";
import { Link } from "react-router-dom";

import ProfileSettingsCard from "../components/profile-settings-card";

interface Props {
  networkId: number;
  publicate: Publicate;
}
interface State {}
export default class Signup extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    checkNetworkId(this.props.publicate, this.props.networkId);
    this.checkUsernameExists();
  }

  async checkUsernameExists() {
    const username = await this.props.publicate.getUsernameFromAddress(
      this.props.publicate.accountAddress
    );
    if (username.length) {
      hashHistory.replace(`/${this.props.networkId}/`);
    }
  }

  render() {
    return (
      <I18n>
        {(t, { i18n }) => (
          <div className="signup-page">
            <h1>{t("routes/signup/title")}</h1>
            <p className="subtitle">
              {t("routes/signup/subtitle")} <br />
              {t("routes/signup/topic-demo")}{" "}
              <Link
                to={`/${this.props.networkId}/topic/publicate`}
                target="_blank"
              >
                #publicate
              </Link>
            </p>
            <ProfileSettingsCard publicate={this.props.publicate} reset={true} />
          </div>
        )}
      </I18n>
    );
  }
}
