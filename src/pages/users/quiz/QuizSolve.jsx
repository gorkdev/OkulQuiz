import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getQuizById } from "../../../services/firebase/questionService";
import { getQuestionsByIds } from "../../../services/firebase/questionService";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const QuizSolve = () => {
  const { quizId } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);
  const [confettiPieces, setConfettiPieces] = useState(0);
  const [answersReview, setAnswersReview] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [optionOrder, setOptionOrder] = useState([]);

  // Konfeti animasyonu
  useEffect(() => {
    if (confettiPieces > 0) {
      const timer = setTimeout(() => {
        setConfettiPieces((prev) => Math.max(prev - 10, 0));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [confettiPieces]);

  // Quiz verilerini yükle
  useEffect(() => {
    async function fetchQuizAndQuestions() {
      setLoading(true);
      try {
        const quizData = await getQuizById(quizId);
        if (!quizData) return;

        let allQuestionIds = [];
        if (quizData.categoryOrder && quizData.questionsByCategory) {
          quizData.categoryOrder.forEach((catId) => {
            const qIds = quizData.questionsByCategory[catId] || [];
            allQuestionIds = allQuestionIds.concat(qIds);
          });
        }

        const questionObjs = await getQuestionsByIds(allQuestionIds);
        setQuizData(quizData);
        setQuestions(questionObjs);
      } catch (error) {
        console.error("Quiz yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuizAndQuestions();
  }, [quizId]);

  // Soru değiştiğinde yapılacaklar
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setAudioPlaying(false);
    }
    setImageLoaded(false);
    setSelectedOptions([]);

    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion.sureVar) {
        setTimeLeft(currentQuestion.sure);
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              // Süre dolduğunda, eğer seçili şık yoksa boş olarak işaretle
              handleNextQuestion(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
      }
    }
  }, [currentQuestionIndex, questions]);

  // Şıkları karıştır veya sırala
  useEffect(() => {
    if (!questions.length || currentQuestionIndex >= questions.length) return;
    const currentQuestion = questions[currentQuestionIndex];
    let initialOrder = currentQuestion.siklar?.map((_, idx) => idx) || [];
    if (currentQuestion.siklariKaristir) {
      initialOrder = shuffleArray(initialOrder);
    }
    setOptionOrder(initialOrder);
    setSelectedOptions([]); // Sıra değişince seçimi sıfırla
  }, [currentQuestionIndex, questions]);

  // Shuffle fonksiyonu
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // DnD sıralama fonksiyonu
  function handleDragEnd(result) {
    if (!result.destination) return;
    const newOrder = Array.from(optionOrder);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    setOptionOrder(newOrder);
    // Sıralı şıklar için seçili sıralamayı da güncelle
    if (currentQuestion.siraliSiklar) {
      setSelectedOptions(newOrder);
    }
  }

  const playQuestionAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.soruSesiVar && currentQuestion.soruSesi) {
      audioRef.current = new Audio(currentQuestion.soruSesi);
      audioRef.current
        .play()
        .then(() => {
          setAudioPlaying(true);
          audioRef.current.addEventListener("ended", () =>
            setAudioPlaying(false)
          );
        })
        .catch((error) => console.error("Ses oynatılamadı:", error));
    }
  };

  const handleOptionSelect = (optionIndex) => {
    const currentQuestion = questions[currentQuestionIndex];

    if (currentQuestion.dogruCevapSayisi === 1) {
      setSelectedOptions([optionIndex]);
    } else {
      setSelectedOptions((prev) => {
        if (prev.includes(optionIndex)) {
          return prev.filter((item) => item !== optionIndex);
        } else {
          return [...prev, optionIndex];
        }
      });
    }
  };

  // handleNextQuestion: skipEmpty true ise, seçili şık yoksa boş olarak işaretle
  const handleNextQuestion = (skipEmpty = false) => {
    const currentQuestion = questions[currentQuestionIndex];

    let selectedForReview;
    if (currentQuestion.siraliSiklar) {
      selectedForReview = [...optionOrder];
    } else {
      selectedForReview = [...selectedOptions];
    }
    // Süre dolduğunda ve hiç seçim yoksa, boş olarak işaretle
    if (skipEmpty && selectedForReview.length === 0) {
      selectedForReview = [];
    }

    let isCorrect;
    if (currentQuestion.siraliSiklar) {
      // Kullanıcının sıraladığı şıkların id/text dizisi
      const userOrder = selectedForReview.map((idx) => {
        const sik = currentQuestion.siklar[idx];
        return sik?.id || sik?.text;
      });
      // Doğru sıralama: siklar'ın mevcut sırası (id/text dizisi)
      const correctOrder = currentQuestion.siklar.map(
        (sik) => sik?.id || sik?.text
      );
      isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
    } else {
      isCorrect =
        JSON.stringify(selectedForReview.sort()) ===
        JSON.stringify(currentQuestion.dogruCevaplar.sort());
    }

    setAnswersReview((prev) => [
      ...prev,
      {
        questionIndex: currentQuestionIndex,
        selected: selectedForReview,
        correct: currentQuestion.dogruCevaplar,
        isCorrect,
      },
    ]);

    if (isCorrect) {
      setScore(score + (currentQuestion.puanVar ? currentQuestion.puan : 1));
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setConfettiPieces(150);
      setTimeout(() => setConfettiPieces(0), 5000);
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptions([]);
    setScore(0);
    setQuizCompleted(false);
    setAnswersReview([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-md font-medium text-gray-700">
            Yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-5 max-w-md bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Quiz Bulunamadı
          </h2>
          <p className="text-gray-600">İstenen quiz yüklenemedi.</p>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    // Not ve mesaj hesaplama
    let grade = "";
    let message = "";
    let color = "";
    const maxScore = questions.reduce(
      (acc, q) => acc + (q.puanVar ? q.puan : 1),
      0
    );
    const percent = (score / maxScore) * 100;
    if (percent >= 90) {
      grade = "A";
      color = "bg-green-200 text-green-900 border-green-400";
      message =
        "Harika! Sen bir süpersin! Tüm soruları neredeyse mükemmel yaptın. Böyle devam et!";
    } else if (percent >= 75) {
      grade = "B";
      color = "bg-blue-200 text-blue-900 border-blue-400";
      message =
        "Çok iyisin! Birkaç küçük hata dışında çoğu soruyu doğru yaptın. Biraz daha çalışırsan süper olacaksın!";
    } else if (percent >= 50) {
      grade = "C";
      color = "bg-yellow-200 text-yellow-900 border-yellow-400";
      message =
        "Fena değil! Daha çok pratik yaparsan çok daha iyi olabilirsin. Vazgeçme!";
    } else {
      grade = "D";
      color = "bg-red-200 text-red-900 border-red-400";
      message =
        "Üzülme! Herkes hata yapabilir. Biraz daha çalışıp tekrar denersen çok daha iyi olacaksın!";
    }
    return (
      <div className="min-h-screen  py-6 px-4 relative">
        {confettiPieces > 0 && (
          <Confetti
            numberOfPieces={confettiPieces}
            recycle={false}
            gravity={0.2}
            wind={0.01}
            initialVelocityY={5}
            style={{ position: "fixed" }}
          />
        )}

        {/* Not ve mesaj kutusu en üstte, genişliği alt kutularla aynı, minimal */}
        <div
          className={`mx-auto maxw3x mb-4 rounded-lg border ${color} flex flex-col items-center justify-center px-4 py-3 text-center shadow-sm`}
          style={{ maxWidth: 770, width: "100%" }}
        >
          <div className="text-2xl font-bold mb-1">Notun: {grade}</div>
          <div className="text-base font-semibold mb-0.5">
            Puanın: {score} / {maxScore}
          </div>
          <div className="text-sm font-medium mt-1">{message}</div>
        </div>

        <div className="mx-auto flex flex-col md:flex-row gap-4 items-stretch max-w-3xl w-full">
          <motion.div
            initial={{ scale: 0.97 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-lg h-80 w-full md:w-96 shadow-sm p-4 flex flex-col justify-center"
          >
            <div className="text-center">
              {/* Tebrikler icon'unun üstünde yeşil kutuda ufak mesaj */}
              <div className="text-xs mb-2 font-semibold bg-green-100 text-green-800 rounded px-3 py-1 inline-block">
                Önceki denemene göre %10 daha iyisin!
              </div>
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                Tebrikler!
              </h2>
              <p className="text-gray-600 mb-3 text-sm">
                Puan: <span className="font-bold text-blue-600">{score}</span>
              </p>
              <button
                onClick={resetQuiz}
                className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          </motion.div>

          <div className="bg-white rounded-lg shadow-sm p-4 flex-1 flex flex-col">
            <h3 className="text-base font-bold text-gray-800 mb-2">Sonuçlar</h3>
            <div className="space-y-2">
              {(() => {
                const shown = new Set();
                return answersReview
                  .filter((ans) => {
                    if (shown.has(ans.questionIndex)) return false;
                    shown.add(ans.questionIndex);
                    return true;
                  })
                  .map((answer, index) => {
                    const question = questions[answer.questionIndex];
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded border ${
                          answer.isCorrect
                            ? "border-green-200 bg-green-50"
                            : "border-red-200 bg-red-50"
                        }`}
                      >
                        <div className="flex items-start">
                          <div
                            className={`flex-shrink-0 w-4 h-4 rounded-full mt-1 mr-2 ${
                              answer.isCorrect ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {question.soruMetni || `Soru ${index + 1}`}
                            </p>
                            <div
                              className={`flex ${
                                question.siklar?.some((sik) => sik.image)
                                  ? "flex-row"
                                  : "flex-col"
                              }`}
                            >
                              {(() => {
                                const hasImageSelected = answer.selected.some(
                                  (s) => question.siklar[s]?.image
                                );
                                if (hasImageSelected) {
                                  return (
                                    <div className="flex flex-row items-center gap-2 mt-1">
                                      <span className="font-medium text-xs text-gray-600">
                                        Senin cevabın:
                                      </span>
                                      {answer.selected.map((s, i) => {
                                        const sik = question.siklar[s];
                                        if (!sik) return null;
                                        return (
                                          <span
                                            key={i}
                                            className="inline-flex items-center mr-2"
                                          >
                                            {sik.image && (
                                              <img
                                                src={sik.image}
                                                alt={sik.text || "Seçenek"}
                                                className="w-6 h-6 rounded object-cover inline-block mr-1 "
                                              />
                                            )}
                                            {sik.text}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  );
                                } else {
                                  return (
                                    <p className="text-xs text-gray-600 mt-1">
                                      <span className="font-medium">
                                        Senin cevabın:
                                      </span>{" "}
                                      {answer.selected
                                        .map((s, i) => question.siklar[s]?.text)
                                        .join(", ")}
                                    </p>
                                  );
                                }
                              })()}
                              {!answer.isCorrect &&
                                (() => {
                                  // Sıralı şıklar için doğru cevabı question.siklar sırasına göre göster
                                  if (question.siraliSiklar) {
                                    const hasImageCorrect =
                                      question.siklar &&
                                      question.siklar.some((sik) => sik?.image);
                                    if (hasImageCorrect) {
                                      return (
                                        <div className="flex flex-row items-center gap-2 mt-1">
                                          <span className="font-medium text-xs text-gray-600">
                                            Doğru cevap:
                                          </span>
                                          {question.siklar &&
                                            question.siklar.map((sik, i) => {
                                              if (!sik) return null;
                                              return (
                                                <span
                                                  key={i}
                                                  className="inline-flex items-center mr-2"
                                                >
                                                  {sik.image && (
                                                    <img
                                                      src={sik.image}
                                                      alt={
                                                        sik.text || "Seçenek"
                                                      }
                                                      className="w-6 h-6 rounded object-cover inline-block mr-1 "
                                                    />
                                                  )}
                                                  {sik.text}
                                                </span>
                                              );
                                            })}
                                        </div>
                                      );
                                    } else {
                                      // Tüm doğru sıralı cevapları question.siklar sırasına göre virgülle ayırarak göster
                                      return (
                                        <p className="text-xs text-gray-600">
                                          <span className="font-medium">
                                            Doğru cevap:
                                          </span>{" "}
                                          {question.siklar &&
                                            question.siklar
                                              .map((sik) => sik?.text)
                                              .filter(Boolean)
                                              .join(", ")}
                                        </p>
                                      );
                                    }
                                  } else {
                                    // Diğer soru tipleri için mevcut davranış
                                    const hasImageCorrect = answer.correct.some(
                                      (c) => question.siklar[c]?.image
                                    );
                                    if (hasImageCorrect) {
                                      return (
                                        <div className="flex flex-row items-center gap-2 mt-1">
                                          <span className="font-medium text-xs text-gray-600">
                                            Doğru cevap:
                                          </span>
                                          {answer.correct.map((c, i) => {
                                            const sik = question.siklar[c];
                                            if (!sik) return null;
                                            return (
                                              <span
                                                key={i}
                                                className="inline-flex items-center mr-2"
                                              >
                                                {sik.image && (
                                                  <img
                                                    src={sik.image}
                                                    alt={sik.text || "Seçenek"}
                                                    className="w-6 h-6 rounded object-cover inline-block mr-1 "
                                                  />
                                                )}
                                                {sik.text}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      );
                                    } else {
                                      return (
                                        <p className="text-xs text-gray-600">
                                          <span className="font-medium">
                                            Doğru cevap:
                                          </span>{" "}
                                          {answer.correct
                                            .map(
                                              (c) => question.siklar[c]?.text
                                            )
                                            .filter(Boolean)
                                            .join(", ")}
                                        </p>
                                      );
                                    }
                                  }
                                })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const hasOptionImages = currentQuestion.siklar?.some((sik) => sik.image);

  // İlgili sorunun bilgilerini console'a yazdır
  console.log("Current Question:", currentQuestion);

  // Seçenekler render
  const renderOptions = () => {
    if (currentQuestion.siraliSiklar) {
      // Sıralanabilir şıklar (DnD) - Quiz oluşturma ile birebir aynı
      return (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="options-droppable">
            {(provided) => (
              <div
                className="flex flex-col gap-3"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {optionOrder.map((optionIdx, idx) => {
                  const option = currentQuestion.siklar[optionIdx];
                  return (
                    <Draggable
                      key={option.id || optionIdx}
                      draggableId={String(option.id || optionIdx)}
                      index={idx}
                    >
                      {(dragProvided, dragSnapshot) => (
                        <div
                          className={`flex items-center gap-4 border border-gray-200 rounded p-3 bg-white dnd-animate ${
                            dragSnapshot.isDragging
                              ? "shadow-lg scale-105 z-10"
                              : ""
                          }`}
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                        >
                          <div
                            {...dragProvided.dragHandleProps}
                            className="cursor-grab pr-2 flex items-center"
                          >
                            <svg
                              width="18"
                              height="18"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle cx="5" cy="7" r="1.5" fill="#888" />
                              <circle cx="5" cy="12" r="1.5" fill="#888" />
                              <circle cx="5" cy="17" r="1.5" fill="#888" />
                              <circle cx="12" cy="7" r="1.5" fill="#888" />
                              <circle cx="12" cy="12" r="1.5" fill="#888" />
                              <circle cx="12" cy="17" r="1.5" fill="#888" />
                            </svg>
                          </div>
                          <div className="flex-1 flex flex-col gap-2">
                            {option.image ? (
                              <div className="relative aspect-square w-16 h-16 mb-1">
                                <img
                                  src={option.image}
                                  alt=""
                                  className="absolute inset-0 w-full h-full object-cover rounded"
                                />
                              </div>
                            ) : null}
                            <span className="text-sm font-medium text-gray-800">
                              {option.text}
                            </span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      );
    } else {
      // Normal veya karışık şıklar
      return (
        <div
          className={`space-y-2 ${
            hasOptionImages ? "grid grid-cols-2 gap-2" : ""
          }`}
        >
          {optionOrder.map((optionIdx, index) => {
            const option = currentQuestion.siklar[optionIdx];
            if (!option) return null;
            return (
              <motion.div
                whileTap={{ scale: 0.98 }}
                key={option.id || optionIdx}
                onClick={() => handleOptionSelect(optionIdx)}
                className={`rounded-md overflow-hidden ${
                  selectedOptions.includes(optionIdx)
                    ? "ring-2 ring-blue-500"
                    : "border border-gray-200"
                }`}
              >
                {option.image ? (
                  <div className="relative aspect-square">
                    <img
                      src={option.image}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={`p-3 ${
                      selectedOptions.includes(optionIdx)
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full border mr-2 ${
                          selectedOptions.includes(optionIdx)
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-400"
                        }`}
                      ></div>
                      <span className="text-sm">{option.text}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-md mx-auto">
        {/* Quiz Başlık */}
        <div className="mb-5">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-blue-600">
              Soru {currentQuestionIndex + 1}/{questions.length}
            </span>
            <div className="flex items-center space-x-3">
              {currentQuestion.puanVar && (
                <span className="text-green-600">
                  {currentQuestion.puan} Puan
                </span>
              )}
              {currentQuestion.sureVar && (
                <span className="text-red-600">{timeLeft}s</span>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{
                width: `${(currentQuestionIndex / questions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Soru Kartı */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-5">
          {/* Soru Görselleri */}
          {currentQuestion.gorselVar &&
            currentQuestion.gorseller?.length > 0 && (
              <div className="mb-4 grid grid-cols-2 gap-2">
                {currentQuestion.gorseller.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square bg-gray-100 rounded overflow-hidden"
                  >
                    <img
                      src={image}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      onLoad={() => setImageLoaded(true)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/200?text=Resim+Yok";
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

          {/* Soru Ses */}
          {currentQuestion.soruSesiVar && currentQuestion.soruSesi && (
            <button
              onClick={playQuestionAudio}
              className={`flex items-center px-3 py-1.5 mb-4 text-xs rounded ${
                audioPlaying
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <svg
                className="w-3 h-3 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728"
                ></path>
              </svg>
              {audioPlaying ? "Oynatılıyor..." : "Sesi Dinle"}
            </button>
          )}

          {/* Soru Metni */}
          <h2 className="text-md font-medium text-gray-800 mb-4">
            {currentQuestion.soruMetni}
          </h2>

          {/* İpucu */}
          {currentQuestion.ipucuVar && currentQuestion.ipucu && (
            <div className="my-4 flex gap-1 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <p className="font-medium text-yellow-800">İpucu:</p>
              <p className="text-yellow-700">{currentQuestion.ipucu}</p>
            </div>
          )}

          {/* Seçenekler */}
          {renderOptions()}
        </div>

        {/* İlerleme Butonu */}
        <button
          onClick={handleNextQuestion}
          disabled={selectedOptions.length === 0 && currentQuestion.soruZorunlu}
          className={`w-full py-2.5 rounded-lg text-sm font-medium ${
            selectedOptions.length === 0 && currentQuestion.soruZorunlu
              ? "bg-gray-200 text-gray-500"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {currentQuestionIndex === questions.length - 1 ? "Bitir" : "Sonraki"}
        </button>
      </div>
    </div>
  );
};

export default QuizSolve;
