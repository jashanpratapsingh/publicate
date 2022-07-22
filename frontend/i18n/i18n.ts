import i18next from "i18next";

i18next.init({
  interpolation: {
    // React already does escaping
    escapeValue: false
  },
  lng: "en", // "en" | "zh"
  resources: {
    en: {
      translation: {
        "general/by-trend": "By trend",
        "general/by-time": "By time",
        "general/follow": "Follow",
        "general/following": "Following",
        "general/unfollow": "Unfollow",
        "general/invalid-topic": "Invalid topic",
        "general/and": "and",
        "general/upvoted": "upvoted",
        "general/donated": "donated",
        "general/Upvote": "Upvote",
        "general/Write-below": "Write below",
        "general/Preview": "Preview",
        "general/Reply-to": "Reply to",
        "general/Post-to-topics": "Post to topics",
        "general/Reply-to-the-following-users": "Reply to the following users",
        "general/Mention-the-following-users": "Mention the following users",
        "general/Configuration": "Configuration",
        "general/Repost-to-timeline": "Repost to timeline",
        "general/Post-to-publicate": "Post to #{publicate} topic",
        "general/Post-as-IPFS-hash": "Post as IPFS hash (Infura)",
        "general/username": "username",
        "general/Username": "Username",
        "general/topic": "topic",
        "general/Display-name": "Display name",
        "general/Avatar-URL": "Avatar URL",
        "general/Cover-URL": "Cover URL",
        "general/Bio-markdown-ready": "Bio (markdown ready)",
        "general/Profile-preview": "Profile preview",
        "general/No-more-replies": "No more replies ;)",
        "general/No-more-feeds": "No more feeds ;)",
        "general/USD": "USD",
        "components/error/feed-footer-part1": "Please make sure",
        "components/error/feed-footer-part2":
          "is running and unlocked in your browser. Switch to Ropsten Test Net, then refresh your browser.",
        "components/header/home": "Home",
        "components/header/topics": "Topics",
        "components/header/notifications": "Notifications",
        "components/header/settings": "Settings",
        "components/header/search-box-placeholder":
          "Enter @username here or #topic that you are interested. ",
        "components/followings-card/title": "my followings",
        "components/topics-card/title": "my favorite topics",
        "components/profile-settings-card/title": "Profile settings",
        "components/profile-settings-card/publish":
          "Publish profile to blockchain",
        "components/profile-settings-card/avatar-url-placeholder":
          "Avatar image url starting with http:// or https://",
        "components/profile-settings-card/cover-url-placeholder":
          "Cover image url starting with http:// or https://",
        "components/profile-settings-card/delete-app-cache":
          "Delete app local cache",
        "components/donate-panel/donate-placeholder":
          "(optional) donate 0.0000 ether to author",
        "routes/signup/title": "Welcome to use Publicate!",
        "routes/signup/subtitle":
          "Please finish your account registration below",
        "routes/signup/topic-demo": "Or check the topic demo: ",
        "notification/init-error":
          "Failed to initialize Publicate. Please make sure you have MetaMask enabled and unlocked.",
        "notification/publish-profile": `Profile is being published to blockchain.\nPlease wait until the transaction finishes, then refresh your browser.`,
        "notification/publish-profile-success": `Your profile information is now saved on blockchain. Please refresh your browser.`,
        "notification/publish-profile-failure": `Failed to save your profile to blockchain.`,
        "notification/publish-downvote": `Your downvote is being published to blockchain.\nPlease wait until the transaction finishes.`,
        "notification/publish-downvote-success": `Your downvote is now saved on blockchain.`,
        "notification/publish-upvote": `Thank you for supporting the author :)\nYour upvote is being published to blockchain.\nPlease wait until the transaction finishes.`,
        "notification/publish-upvote-success": `Your upvote is now saved on blockchain.`,
        "notification/publish-post": `Your post is being published to blockchain.\nPlease wait until the transaction finishes.`,
        "notification/publish-post-success": `Your post is now saved on blockchain.`,
        "notification/publish-reply-success": `Your reply is now saved on blockchain.`,
        "notification/publish-post-failure": `Failed to save your post to blockchain.`,
        "notification/username-taken": `Username {{username}} is already taken.`,
        "notification/user-address-doesnt-exist": `User with address {{userAddress}} doesn't exist.`,
        "notification/Syncing-block-from-blockchain": `Syncing {{index}}/{{total}} transaction at block {{blockNumber}} from blockchain...`,
        "notification/Syncing-block-from-database": `Syncing block {{blockNumber}} from database...`,
        "notification/app-local-cache-deletion-success":
          "App local cache are deleted successfully. Browser will be refreshed soon.",
        "notification/app-local-cache-deletion-failure":
          "Failed to delete app local cache",
        "notification/ipfs-hash-not-found": `Failed to cat IPFS hash: [{{name}}]({{link}}).`,
        "notification/wrong-networkId": `Connected to the wrong network: {{given}}。Please reconnect to: {{required}}`,
        "notification/invalid-username": `Invalid username: {{username}}`,
        "notification/generating-ipfs-hash":
          "Generating IPFS hash, please wait...",
        "notification/generating-ipfs-hash-failure":
          "Failed to generate IPFS hash."
      }
    },
    
  }
});

window["i18n"] = i18next;
export default i18next;
