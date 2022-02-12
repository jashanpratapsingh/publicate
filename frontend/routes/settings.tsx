import * as React from "react";

import Header, { Page } from "../components/header";
import ProfileSettingsCard from "../components/profile-settings-card";
import { Publicate, UserInfo } from "../lib/publicate";
import { checkUserRegistration, checkNetworkId } from "../lib/utility";

interface Props {
  publicate: Publicate;
  networkId: number;
}
interface State {}

export default class Settings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    checkNetworkId(this.props.publicate, this.props.networkId);
    checkUserRegistration(this.props.publicate);
  }

  componentWillReceiveProps(newProps: Props) {
    checkNetworkId(newProps.publicate, newProps.networkId);
    checkUserRegistration(newProps.publicate);
  }

  render() {
    return (
      <div className="settings-page">
        <Header publicate={this.props.publicate} page={Page.SettingsPage} />
        <ProfileSettingsCard
          publicate={this.props.publicate}
          showDeleteAppCacheButton={true}
        />
      </div>
    );
  }
}
