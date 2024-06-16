import React, { useState, useEffect } from 'react';
import './Quiz.css';
import data from '../../assets/data.json';

const Quiz = () => {
    const [index, setIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState(Array(data.length).fill(null));
    const [showResult, setShowResult] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes timer
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);

    useEffect(() => {
        if (quizStarted) {
            const timer = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime > 1) {
                        return prevTime - 1;
                    } else {
                        clearInterval(timer);
                        setShowResult(true);
                        return 0;
                    }
                });
            }, 1000);

            document.addEventListener('fullscreenchange', handleFullscreenChange);
            document.addEventListener('keydown', handleKeyPress); // Listen for F11 key
            
            return () => {
                clearInterval(timer);
                document.removeEventListener('fullscreenchange', handleFullscreenChange);
                document.removeEventListener('keydown', handleKeyPress);
            };
        }
    }, [quizStarted]);

    const handleFullscreenChange = () => {
        setIsFullscreen(document.fullscreenElement !== null);
    };

    const handleFullscreenRequest = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
            });
        }
    };

    const startQuiz = () => {
        handleFullscreenRequest();
        setQuizStarted(true);
        setShowInstructions(false); // Hide instructions after starting quiz
    };

    const restartQuiz = () => {
        setIndex(0);
        setSelectedAnswers(Array(data.length).fill(null));
        setShowResult(false);
        setTimeLeft(600);
        handleFullscreenRequest();
        setQuizStarted(true); // Ensure quiz started state is true on restart
        setShowInstructions(false); // Hide instructions after starting quiz
    };

    const handleAnswerClick = (answerIndex) => {
        const newSelectedAnswers = [...selectedAnswers];
        newSelectedAnswers[index] = answerIndex;
        setSelectedAnswers(newSelectedAnswers);
    };

    const handleNextClick = () => {
        if (index + 1 < data.length) {
            setIndex(index + 1);
        } else {
            setShowResult(true);
        }
    };

    const calculateResult = () => {
        let correctCount = 0;
        selectedAnswers.forEach((selectedAnswer, idx) => {
            if (selectedAnswer !== null && selectedAnswer === data[idx].ans) {
                correctCount++;
            }
        });
        return correctCount;
    };

    const getTotalQuestions = () => data.length;

    const getTotalAttempted = () => {
        let count = 0;
        selectedAnswers.forEach(answer => {
            if (answer !== null) {
                count++;
            }
        });
        return count;
    };

    const handleKeyPress = (event) => {
        if (event.key === 'F11') {
            event.preventDefault(); // Prevent browser default action
            handleFullscreenRequest();
        }
    };

    if (!quizStarted || (!isFullscreen && !showInstructions)) {
        return (
            <div className="fullscreen-notice">
                <div className="content">
                    <h1>Quiz App</h1>
                    {showInstructions && (
                        <>
                            <p>Welcome to the Quiz App!</p>
                            <p>Please read the rules and instructions below:</p>
                            <ul>
                            <li>Rule 1: You have to attend the quiz in fullscreen mode.</li>
                                <li>Rule 2: Indulging in any cheating or prohibited activity may lead to automatic submission .</li>
                                <li>Rule 3: You have 10 minutes for 10 questions.</li>
                            </ul>
                            <button onClick={startQuiz}>Start  Quiz</button>
                        </>
                    )}
                    {!isFullscreen && !showInstructions && <button onClick={handleFullscreenRequest}>Enter Fullscreen</button>}
                </div>
            </div>
        );
    }

    if (showResult) {
        const correctCount = calculateResult();
        return (
            <div className='container'>
                <h1>Quiz Completed</h1>
                <hr />
                <h2>You got {correctCount}  correct out of  {getTotalQuestions()} !</h2>
                <button onClick={restartQuiz}>Restart Quiz</button>
            </div>
        );
    }

    const question = data[index];
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className='container'>
            <div className='timer'>Time Left: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</div>
            <h1>Quiz App</h1>
            <hr />
            <h2>{index + 1}. {question.question}</h2>
            <ul>
                {[question.option1, question.option2, question.option3, question.option4].map((option, i) => (
                    <li
                        key={i}
                        onClick={() => handleAnswerClick(i + 1)}
                        className={`${selectedAnswers[index] === i + 1 ? 'selected' : ''} ${selectedAnswers[index] === i + 1 ? 'clicked' : ''}`}
                    >
                        {option}
                    </li>
                ))}
            </ul>
            <button onClick={handleNextClick}>Next</button>
            <div className='index'>{index + 1} of {data.length} Questions</div>
        </div>
    );
};

export default Quiz;