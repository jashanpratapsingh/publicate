import * as React from "react";
import { I18n } from "react-i18next";
import { Link } from "react-router-dom";

import { Publicate } from "../lib/publicate";

interface TopicProps {
  name: string;
  networkId: number;
}
interface TopicState {}
class Topic extends React.Component<TopicProps, TopicState> {
  constructor(props: TopicProps) {
    super(props);
  }

  render() {
    return (
      <Link
        to={`/${this.props.networkId}/topic/${this.props.name}`}
        target="_blank"
      >
        <div className="topic">
          <i className="fas fa-hashtag" />
          <span className="name">{this.props.name}</span>
        </div>
      </Link>
    );
  }
}

interface Props {
  publicate: Publicate;
}
interface State {}
export default class TopicsCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const publicate = this.props.publicate;
    return (
      <I18n>
        {(t, { i18n }) => (
          <div className="topics-card card">
            <p className="title">{t("components/topics-card/title")}</p>
            <div className="topics-list">
              {publicate.settings.followingTopics.map((followingTopic, offset) => {
                return (
                  <Topic
                    name={followingTopic.topic}
                    networkId={publicate.networkId}
                    key={offset}
                  />
                );
              })}
            </div>
          </div>
        )}
      </I18n>
    );
  }
}
