/**
 * Generates a random number between min and max
 */
export const random = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * Create unique id
 * @param length
 * @param specials
 * @returns
 */
export const uid = (length: number, specials: string = "") => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" + specials;
  const charactersLen = characters.length;
  let val = "";
  for (let i = 0; i < length; i++) {
    val += characters.charAt(random(0, charactersLen - 1));
  }
  return val;
};

/**
 * 仅用于内存存储
 */
export const createSessionId = () => `session-${uid(36)}`;

/**
 * @TODO 该id会作为消息的唯一标识，需要确保其唯一性，应异步获取。
 */
export const createMessageId = () => `message-${uid(36)}`;
