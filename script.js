document.addEventListener('DOMContentLoaded', () => {
    const inicioBtn = document.getElementById('inicio');
    const feedbackBtn = document.getElementById('feedback');
    const membrosBtn = document.getElementById('membros');
    const noticiasBtn = document.getElementById('noticias');

    const inicioSection = document.getElementById('inicio-section');
    const feedbackSection = document.getElementById('feedback-section');
    const membrosSection = document.getElementById('membros-section');
    const noticiasSection = document.getElementById('noticias-section');
    const headerImage = document.getElementById('header-image');
    const atomText = document.getElementById('atom-text');
    let atomTextContent = "GREMIO ATOM";
    const anonymousCheck = document.getElementById('anonymous-check');
    const nameInput = document.getElementById('name');
    const serieInput = document.getElementById('serie');
    const feedbackText = document.getElementById('feedback-text');
    const submitFeedbackButton = document.getElementById('submit-feedback');
    const body = document.body;
    let feedbackCount = 0;

    function getLikedStatus() {
      return localStorage.getItem('newsLiked') === 'true';
    }

    function setLikedStatus(liked) {
      localStorage.setItem('newsLiked', liked);
    }

    function getLikedStatusDestaque() {
      return localStorage.getItem('newsLikedDestaque') === 'true';
    }

    function setLikedStatusDestaque(likedDestaque) {
      localStorage.setItem('newsLikedDestaque', likedDestaque);
    }

    function getLikedStatusDebate() {
      return localStorage.getItem('newsLikedDebate') === 'true';
    }

    function setLikedStatusDebate(likedDebate) {
      localStorage.setItem('newsLikedDebate', likedDebate);
    }

    function showSection(section) {
        const sections = document.querySelectorAll('section');
        sections.forEach(s => {
            s.classList.remove('active-section');
            s.classList.remove('slide-in');
            s.classList.add('hidden-section');
        });

        section.classList.remove('hidden-section');
        section.classList.add('active-section');
        section.classList.add('slide-in');
    }

    function setActiveButton(button) {
        const buttons = document.querySelectorAll('.nav-button');
        buttons.forEach(btn => btn.classList.remove('active'));

        if (button !== null) {
            button.classList.add('active');
        }
    }

    inicioBtn.addEventListener('click', () => {
        showSection(inicioSection);
        setActiveButton(inicioBtn);
    });

    feedbackBtn.addEventListener('click', () => {
        showSection(feedbackSection);
        setActiveButton(feedbackBtn);
    });

    membrosBtn.addEventListener('click', () => {
        showSection(membrosSection);
        setActiveButton(membrosBtn);
    });

    noticiasBtn.addEventListener('click', () => {
        showSection(noticiasSection);
        setActiveButton(noticiasBtn);
    });

    showSection(inicioSection);
    setActiveButton(inicioBtn);

    anonymousCheck.checked = false;

    headerImage.classList.remove('active');
    atomText.classList.remove('active');

    setTimeout(() => {
        headerImage.classList.add('active');
        atomText.classList.add('active');
    }, 500);

    function typeWriter(textElement, text, i, cb) {
        if (i < text.length) {
            textElement.textContent += text.charAt(i);
            setTimeout(() => typeWriter(textElement, text, i + 1, cb), 50);
        } else if (cb) {
            setTimeout(cb, 15000);
        }
    }

    function restartTypingAnimation() {
        atomText.textContent = '';
        typeWriter(atomText, atomTextContent, 0, restartTypingAnimation);
    }

    setTimeout(() => {
        restartTypingAnimation();
    }, 2000);

    anonymousCheck.addEventListener('change', function() {
        const isChecked = this.checked;
        nameInput.style.display = isChecked ? 'none' : 'block';
        serieInput.style.display = isChecked ? 'none' : 'block';

    });

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = message;
        body.appendChild(notification);

        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
            notification.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
            setTimeout(() => {
                body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    submitFeedbackButton.addEventListener('click', function() {
        const isAnonymous = anonymousCheck.checked;
        const name = nameInput.value;
        const serie = serieInput.value;
        const feedback = feedbackText.value;

        let messageContent = "";

        if (isAnonymous) {
            messageContent = `**Feedback Anônimo:**\n\`\`\`\nFeedback: ${feedback}\`\`\``;
            console.log("Anonymous Feedback: ", feedback);
        } else {
            messageContent = `**Feedback de Nº:** ${++feedbackCount}\n\`\`\`\nNome: ${name}\nSérie: ${serie}\nFeedback: ${feedback}\`\`\``;
            console.log("Name: ", name, "Serie: ", serie, "Feedback: ", feedback);
        }

        fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            const userIP = data.ip;
            messageContent += `\nIP do usuário: ${userIP}`;

            const webhookURL = 'https://discord.com/api/webhooks/1349518564566110208/757vKKOg7YsDl_P4RbbeJWuEjljk-hiS1hvgGwUiyuOieVHFi28Mnou95G7y2dHFYWrv';

            const payload = {
                content: messageContent
            };

            fetch(webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(response => {
                if (response.ok) {
                    console.log("Feedback sent to Discord successfully!");
                    showNotification('Feedback enviado com sucesso!');
                } else {
                    console.error("Failed to send feedback to Discord:", response.status);
                    showNotification('Erro ao enviar feedback. Por favor, tente novamente.');
                }
            })
            .catch(error => {
                console.error("Error sending feedback to Discord:", error);
                showNotification('Erro ao enviar feedback. Por favor, tente novamente.');
            });
        })

        nameInput.value = '';
        serieInput.value = '';
        feedbackText.value = '';
        anonymousCheck.checked = false;
        nameInput.style.display = 'block';
        serieInput.style.display = 'block';
    });

    function createLikeButtonListeners(buttonId, iconId, likedStatusFn, setLikedStatusFn, likeCountKey, likeClickedKey, likeTimeoutKey, likeInteractionCountKey, lastInteractionTimeKey, newsTitle) {
      const likeButton = document.getElementById(buttonId);
      const likeIcon = document.getElementById(iconId);

      let liked = likedStatusFn();
      let likeCount = parseInt(localStorage.getItem(likeCountKey)) || 0;
      let likeClicked = false;
      let likeTimeout;
      let likeInteractionCount = parseInt(localStorage.getItem(likeInteractionCountKey)) || 0;
      let lastInteractionTime = parseInt(localStorage.getItem(lastInteractionTimeKey)) || 0;
      let blockEndTime = parseInt(localStorage.getItem('blockEndTime' + likeCountKey)) || 0;
    
        function updateLikeButtonUI() {
            if (liked) {
                likeIcon.textContent = '❤️';
                likeButton.classList.add('liked');
            } else {
                likeIcon.textContent = '🖤';
                likeButton.classList.remove('liked');
            }
        }
    
        updateLikeButtonUI();
    
        likeButton.addEventListener('click', () => {
            const currentTime = Date.now();
            const timeWindow = 2 * 60 * 1000;
            const blockDuration = 30 * 60 * 1000;
    
            blockEndTime = parseInt(localStorage.getItem('blockEndTime' + likeCountKey)) || 0;
            if (currentTime < blockEndTime) {
                const remainingTime = Math.ceil((blockEndTime - currentTime) / 60000);
                showNotification(`Você está bloqueado por ${remainingTime} minutos.`);
                return;
            }
    
            if (currentTime - lastInteractionTime < timeWindow) {
                likeInteractionCount++;
                localStorage.setItem(likeInteractionCountKey, likeInteractionCount.toString());
    
                if (likeInteractionCount > 5) {
                    const blockEndTime = currentTime + blockDuration;
                    localStorage.setItem('blockEndTime' + likeCountKey, blockEndTime.toString());
    
                    showNotification('Você excedeu o limite de interações. Bloqueado por 30 minutos.');
                    return;
                }
            } else {
                likeInteractionCount = 1;
                localStorage.setItem(likeInteractionCountKey, likeInteractionCount.toString());
            }
    
            lastInteractionTime = currentTime;
            localStorage.setItem(lastInteractionTimeKey, lastInteractionTime.toString());
    
            if (!likeClicked) {
                if (!liked) {
                    liked = true;
                    likeCount++;
                    likeIcon.classList.add('liked');
                    likeClicked = true;
    
                    setLikedStatusFn(liked);
                    localStorage.setItem(likeCountKey, likeCount.toString());
    
                    fetch('https://api.ipify.org?format=json')
                        .then(response => response.json())
                        .then(data => {
                            const userIP = data.ip;
                            const webhookURL = 'https://discord.com/api/webhooks/1350240750721564752/S2r3uYYV3LyoBOMeSVUK-iAC9KT_1dUK2wLEkHzNdYOvll5GTL5aSwqXrlYG3WAWuLKD';
                            const payload = {
                                content: `
                            **+1 like em: "${newsTitle}"**
                            total de likes: ${likeCount}
                            `
                            };
    
                            fetch(webhookURL, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(payload)
                            })
                                .then(response => {
                                    if (response.ok) {
                                        console.log("Like notification sent to Discord successfully!");
                                    } else {
                                        console.error("Failed to send like notification to Discord:", response.status);
                                    }
                                })
                                .catch(error => {
                                    console.error("Error sending like notification to Discord:", error);
                                });
                        })
                        .catch(error => {
                            console.error("Error getting user's IP address:", error);
                        });
    
                    likeTimeout = setTimeout(() => {
                        likeClicked = false;
                        likeIcon.classList.remove('liked');
                    }, 200);
                } else {
                    liked = false;
                    likeIcon.textContent = '🖤';
                    setLikedStatusFn(liked);
                }
                updateLikeButtonUI();
            } else {
                showNotification('Você só pode dar um like por notícia!');
            }
    
        });
    }

    createLikeButtonListeners(
      'like-button',
      'like-icon',
      getLikedStatus,
      setLikedStatus,
      'likeCount',
      'likeClicked',
      'likeTimeout',
      'likeInteractionCount',
      'lastInteractionTime',
      '📢 ELEIÇÃO GRÊMIO ESTUDANTIL – VOTAÇÃO DIA 20/03 🗳️'
    );
    
    createLikeButtonListeners(
      'like-button-destaque',
      'like-icon-destaque',
      getLikedStatusDestaque,
      setLikedStatusDestaque,
      'likeCountDestaque',
      'likeClickedDestaque',
      'likeTimeoutDestaque',
      'likeInteractionCountDestaque',
      'lastInteractionTimeDestaque',
      'Chapa ATOM se destaca no debate!'
    );
    
    createLikeButtonListeners(
      'like-button-debate',
      'like-icon-debate',
      getLikedStatusDebate,
      setLikedStatusDebate,
      'likeCountDebate',
      'likeClickedDebate',
      'likeTimeoutDebate',
      'likeInteractionCountDebate',
      'lastInteractionTimeDebate',
      'Preparados para o debate no dia 17/03?'
    );
});