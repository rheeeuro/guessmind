const notifications = document.getElementById("jsNotifications");

const fireNotification = (text, color) => {
  const notification = document.createElement("div");
  notification.innerText = text;
  notification.style.backgroundColor = color;
  notifications.appendChild(notification);
};

export const handleNewUser = ({ nickname }) =>
  fireNotification(`${nickname} 님이 입장하였습니다`, "rgb(0, 122, 255)");

export const handleDisconnected = ({ nickname }) =>
  fireNotification(`${nickname} 님이 퇴장하였습니다`, "rgb(255, 149, 0)");
