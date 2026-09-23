export const isPdf = (url) => url?.toLowerCase().endsWith(".pdf");

export const isValidURL = (url) => {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:", "ftp:"].includes(parsed.protocol)) {
      return false;
    }
    return /\.(mp4|webm|ogg|ogv|mov|m3u8|mkv|avi)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
};

export const getYouTubeVideoId = (url) => {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url?.match(regExp);
  if (match) {
    return match && match[2].length === 11 ? match[2] : null;
  } else {
    return false;
  }
};

export const getVimeoVideoId = (url) => {
  const regExp = /^.*(vimeo\.com\/)(?:video\/|channels\/[^\/]+\/|groups\/[^\/]+\/videos\/)?(\d+).*/;
  const match = url?.match(regExp);
  return match ? match[2] : null;
};

export const isValidYouTubeUrl = (url) => !!getYouTubeVideoId(url);

export const isValidVimeoUrl = (url) => !!getVimeoVideoId(url);
