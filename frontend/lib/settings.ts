export interface Settings {
  postAsIPFSHash: boolean;
  postToPublicateTopic: boolean;
  followingUsernames: {
    /**
     * username that you are following
     */
    username: string;
    /**
     * when you started following this user
     */
    timestamp: number;
    /**
     * order of this username
     */
    order?: number;
  }[];
  followingTopics: {
    /**
     * topic and you are following
     */
    topic: string;
    /**
     * when you started following this topic
     */
    timestamp: number;
    /**
     * order of this topic
     */
    order?: number;
  }[];
  /**
   * Language for Publicate web interface.
   */
  language: string;
}
