import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { Letter, Score, TopScore } from "./types";

function App() {
  const [tiles, setTiles] = useState(Array(10).fill(""));
  const [score, setScore] = useState(0);
  const [topScores, setTopScores] = useState<Array<TopScore> | []>([]);
  const inputRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const nextElement = inputRef.current.find((ref) => ref && !ref.value);
    if (nextElement) {
      nextElement.focus();
    }
  }, [tiles]);

  const calculateScore = (letter: Letter): number => {
    const letterScores: Record<string, number> = {
      A: 1,
      E: 1,
      I: 1,
      O: 1,
      U: 1,
      L: 1,
      N: 1,
      S: 1,
      T: 1,
      R: 1,
      D: 2,
      G: 2,
      B: 3,
      C: 3,
      M: 3,
      P: 3,
      F: 4,
      H: 4,
      V: 4,
      W: 4,
      Y: 4,
      K: 6,
      J: 8,
      X: 8,
      Q: 10,
      Z: 10,
    };

    return letterScores[letter.toUpperCase()] || 0;
  };

  const handleTileChange = (letter: string, index: number) => {
    const newTiles = [...tiles];
    newTiles[index] = letter;
    setTiles(newTiles);

    const newScore = newTiles.reduce(
      (acc, cur) => acc + calculateScore(cur),
      0
    );
    setScore(newScore);
  };

  const handleResetTiles = () => {
    setTiles(Array(10).fill(""));
    setScore(0);
  };

  const handleSaveScore = async () => {
    if (score > 0) {
      const payload = {
        word: tiles.join(""),
        score: score,
      };
      try {
        const response = await fetch(
          "http://localhost:8080/scrabble/api/savescore",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
        const scoresResponse = await response.json();
        console.log(scoresResponse);
        setTiles(Array(10).fill(""));
        setScore(0);
      } catch (ex) {
        console.log(ex);
      }
    }
  };

  const handleShowScores = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/scrabble/api/topscores"
      );
      const scoresResponse = await response.json();
      console.log(scoresResponse);
      setTopScores(scoresResponse);
    } catch (ex) {
      console.log(ex);
    }
  };

  return (
    <div className="game-board">
      <div className="tiles-container">
        {tiles.map((letter, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            value={letter}
            onChange={(e) => handleTileChange(e.target.value, index)}
            ref={(input) => (inputRef.current[index] = input)}
          />
        ))}
      </div>
      <div className="total-score">Score:{score}</div>
      <div className="menu-container">
        <button onClick={handleResetTiles}>Reset Tiles</button>
        <button onClick={handleSaveScore}>Save Score</button>
        <button onClick={handleShowScores}>View Top Score</button>
      </div>
      {topScores.length > 0 && (
        <div className="top-scores">
          <div className="flex flex-row">
            <div className="flex-1 bold align-center border-1">Word</div>
            <div className="flex-1 bold align-center border-1 border-left-width-0">
              Score
            </div>
          </div>
          {topScores.map(({ word, score }, index) => (
            <div key={index} className="flex flex-row">
              <div className="flex-1 bold align-center border-1 border-top-width-0">
                {word}
              </div>
              <div className="flex-1 bold align-center border-1 border-top-width-0 border-left-width-0">
                {score}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
