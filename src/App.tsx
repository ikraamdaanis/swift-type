import { generate } from "random-words";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useTimer } from "react-timer-hook";
import { cn } from "utils/cn";

type Word = {
  word: string;
  index: number;
  correct: boolean;
};

const generateWords = (count: number) => {
  const generatedWords = generate({ maxLength: 6, exactly: count }) as string[];
  return generatedWords.map((word, index) => ({
    word,
    index,
    correct: false
  }));
};

const useWordTyping = (wordCount: number) => {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedWord, setTypedWord] = useState("");

  const time = new Date();
  time.setSeconds(time.getSeconds() + 60);

  const {
    totalSeconds,
    pause
    // seconds,
    // minutes,
    // hours,
    // days,
    // isRunning,
    // start,
    // resume,
    // restart
  } = useTimer({
    expiryTimestamp: time,
    onExpire: () => console.warn("onExpire called")
  });

  useEffect(() => {
    setWords(generateWords(wordCount));
  }, [wordCount]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    const lastChar = value.slice(-1);

    if (lastChar === " ") {
      setTypedWord("");

      if (value.trim() === "") return;
      setCurrentIndex(prev => {
        const newIndex = prev + 1;

        if (newIndex === words.length) {
          inputRef.current?.blur();
          pause();
        }

        return newIndex;
      });

      return;
    }

    setTypedWord(value);

    const currentWord = words[currentIndex].word;
    const correct = value === currentWord;

    if (correct) {
      setWords(prev =>
        prev.map(word => {
          if (word.index === currentIndex) {
            return { ...word, correct };
          }
          return word;
        })
      );
    }

    console.log(currentIndex);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return {
    words,
    currentIndex,
    typedWord,
    handleChange,
    inputRef,
    timer: totalSeconds,
    containerRef
  };
};

export const App = () => {
  const {
    words,
    currentIndex,
    typedWord,
    handleChange,
    inputRef,
    timer,
    containerRef
  } = useWordTyping(5);

  return (
    <main className="flex h-screen w-full items-center justify-center">
      <section className="mx-auto flex max-w-screen-lg flex-col items-center justify-center gap-8">
        <p className="text-2xl font-semibold">{timer}</p>
        <div
          className="flex items-center gap-4 overflow-y-auto border border-zinc-300 px-4 py-8"
          ref={containerRef}
        >
          {words.map(word => (
            <span
              key={word.index}
              className={cn(
                word.index === currentIndex && "bg-blue-300",
                word.correct && "text-green-500",
                !word.correct && word.index < currentIndex && "text-red-500"
              )}
            >
              {word.word}
            </span>
          ))}
        </div>
        <textarea
          ref={inputRef}
          autoFocus
          onChange={handleChange}
          rows={1}
          className="border bg-blue-300 p-4"
          value={typedWord}
        />
      </section>
    </main>
  );
};
