import * as Autolinker from "autolinker";
import * as validator from "validator";
import * as LZString from "lz-string";
import { Publicate } from "./publicate";
import hashHistory from "./history";
import i18n from "../i18n/i18n";

export function hexEncode(h: string): string {
  var hex, i;

  var result = "";
  for (i = 0; i < h.length; i++) {
    hex = h.charCodeAt(i).toString(16);
    result += ("000" + hex).slice(-4);
  }

  return result;
}

window["hexEncode"] = hexEncode;

export function hexDecode(s: string): string {
  var j;
  var hexes = s.match(/.{1,4}/g) || [];
  var back = "";
  for (j = 0; j < hexes.length; j++) {
    back += String.fromCharCode(parseInt(hexes[j], 16));
  }

  return back;
}

window["hexDecode"] = hexDecode;

export function compressString(s: string): string {
  return LZString.compressToUTF16(s);
}

window["compressString"] = compressString;

export function decompressString(s: string): string {
  return LZString.decompressFromUTF16(s);
}

window["decompressString"] = decompressString;

export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const passedTime = Math.abs(diff);

  if (passedTime <= 1000 * 60 * 60 * 24) {
    // within 24h
    if (passedTime <= 1000 * 60 * 60) {
      // within 1 hour
      return (
        (diff < 0 ? "future " : "") + Math.ceil(passedTime / (1000 * 60)) + "m"
      );
    } else {
      return (
        (diff < 0 ? "future " : "") +
        Math.floor(passedTime / (1000 * 60 * 60)) +
        "h"
      );
    }
  } else {
    const monthNamesShort = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    return (
      monthNamesShort[date.getMonth()] +
      " " +
      date.getDate() +
      " " +
      date.getFullYear()
    );
  }
}

// check whether a user is registered or not.
// if not, jump to the signup page.
export async function checkUserRegistration(publicate: Publicate) {
  const username = await publicate.getUsernameFromAddress(publicate.accountAddress);
  if (!username || !username.length) {
    hashHistory.replace(`/${publicate.networkId}/signup`);
  }
}

export function checkNetworkId(publicate: Publicate, networkId: number) {
  console.log(publicate.networkId, networkId);
  console.log(
    publicate.getNetworkName(publicate.networkId),
    publicate.getNetworkName(networkId)
  );
  if (publicate.networkId !== networkId) {
    new window["Noty"]({
      type: "success",
      text: i18n.t("notification/wrong-networkId", {
        given: publicate.getNetworkName(publicate.networkId),
        required: publicate.getNetworkName(networkId)
      }),
      timeout: 10000
    }).show();
    return false;
  } else {
    return true;
  }
}
