export type StoryStage =
    | 'GALAXY'
    | 'EARTH_DESCENT'
    | 'RIVER_SCENE'
    | 'FISHING'
    | 'FISH_SUCCESS'
    | 'FISH_TRANSFORMATION'
    | 'MONKEY_SPIN'
    | 'ENVELOPE_TRANSFORMATION'
    | 'LETTER_OPENING'
    | 'LETTER_READ'
    | 'COCONUT_FIREWORKS'
    | 'ENDING';

export type FishingStatus = 'idle' | 'charging' | 'success' | 'failure' | 'retry';

export interface LetterConfig {
    paragraphs: string[];
    signature: string;
}

export const DEFAULT_LETTER_CONTENT: LetterConfig = {
    paragraphs: [
        "Chúc em một buổi sáng thật bình yên và dịu dàng.",
        "Mong rằng giữa những bộn bề của cuộc sống, em vẫn luôn tìm thấy cho mình một khoảng trời riêng để nghỉ ngơi, mỉm cười và tận hưởng những điều nhỏ bé nhưng đáng quý.",
        "Chúc cho mọi muộn phiền dần tan theo dòng nước, những điều tốt đẹp sẽ đến như ánh nắng ban mai, và niềm vui sẽ luôn ghé thăm em theo những cách bất ngờ nhất.",
        "Hy vọng lá thư nhỏ này có thể mang đến cho em một chút ấm áp, một chút bất ngờ và thật nhiều niềm vui trong buổi sáng hôm nay.",
        "Hãy luôn vui vẻ, bình an và giữ cho mình một trái tim đầy hy vọng nhé!"
    ],
    signature: "Gửi đến em những điều tốt đẹp nhất."
};