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
    let atomTextContent = "GRÊMIO ATOM"; // Store the original text
    const anonymousCheck = document.getElementById('anonymous-check');
    const nameInput = document.getElementById('name');
    const serieInput = document.getElementById('serie');
    const feedbackText = document.getElementById('feedback-text');
    const submitFeedbackButton = document.getElementById('submit-feedback');
    const body = document.body; // Added to append notification
    let feedbackCount = 0;

    // Function to retrieve the liked status from local storage
    function getLikedStatus() {
      return localStorage.getItem('newsLiked') === 'true';
    }

    // Function to save the liked status to local storage
    function setLikedStatus(liked) {
      localStorage.setItem('newsLiked', liked);
    }

    // Function to retrieve the like count from local storage
    function getLikeCount() {
      const count = localStorage.getItem('likeCount');
      return count ? parseInt(count) : 0;
    }

    // Function to save the like count to local storage
    function setLikeCount(count) {
      localStorage.setItem('likeCount', count);
    }

    function showSection(section) {
        // Hide all sections
        const sections = document.querySelectorAll('section');
        sections.forEach(s => {
            s.classList.remove('active-section');
            s.classList.remove('slide-in');
            s.classList.add('hidden-section');
        });

        // Show the selected section with animation
        section.classList.remove('hidden-section');
        section.classList.add('active-section');
        section.classList.add('slide-in');
    }

    function setActiveButton(button) {
        // Remove active class from all buttons
        const buttons = document.querySelectorAll('.nav-button');
        buttons.forEach(btn => btn.classList.remove('active'));

        // Add active class to the selected button
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

    // Set "Início" as default active
    showSection(inicioSection);
    setActiveButton(inicioBtn);

    // Disable the anonymous checkbox by default
    anonymousCheck.checked = false;

    // Initial animation
    headerImage.classList.remove('active');
    atomText.classList.remove('active');

    setTimeout(() => {
        headerImage.classList.add('active');
        atomText.classList.add('active');
    }, 500);

    // Typing animation function
    function typeWriter(textElement, text, i, cb) {
        if (i < text.length) {
            textElement.textContent += text.charAt(i);
            setTimeout(() => typeWriter(textElement, text, i + 1, cb), 50); // Adjust typing speed here
        } else if (cb) {
            setTimeout(cb, 15000);
        }
    }

    // Function to reset and restart the typing animation
    function restartTypingAnimation() {
        atomText.textContent = ''; // Clear the text
        typeWriter(atomText, atomTextContent, 0, restartTypingAnimation); // Restart the animation
    }

    // Start the typing animation
    setTimeout(() => {
        restartTypingAnimation();
    }, 2000);

    anonymousCheck.addEventListener('change', function() {
        const isChecked = this.checked;
        nameInput.style.display = isChecked ? 'none' : 'block';
        serieInput.style.display = isChecked ? 'none' : 'block';

        // Show notification
        //showNotification(isChecked ? 'Modo Anônimo Ativado' : 'Modo Anônimo Desativado');
    });

    // Function to display notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = message;
        body.appendChild(notification);

        // Show notification
        notification.classList.add('show');

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            notification.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out'; // Restore the default transition
            setTimeout(() => {
                body.removeChild(notification);
            }, 300); // Small delay to allow fade-out transition
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
                    showNotification('Feedback enviado com sucesso!'); // Show success notification
                } else {
                    console.error("Failed to send feedback to Discord:", response.status);
                    showNotification('Erro ao enviar feedback. Por favor, tente novamente.'); // Show error notification
                }
            })
            .catch(error => {
                console.error("Error sending feedback to Discord:", error);
                showNotification('Erro ao enviar feedback. Por favor, tente novamente.'); // Show error notification
            });
        })

        nameInput.value = '';
        serieInput.value = '';
        feedbackText.value = '';
        anonymousCheck.checked = false;
        nameInput.style.display = 'block';
        serieInput.style.display = 'block';
    });

    const likeButton = document.getElementById('like-button');
    const likeIcon = document.getElementById('like-icon');
    const likeCountElement = document.getElementById('like-count');

    // Load the initial liked status and like count from local storage
    let liked = getLikedStatus();
    let likeCount = getLikeCount();

    // Update the UI based on the loaded status
    if (liked) {
        likeIcon.textContent = '🖤';
    } else {
        likeIcon.textContent = '❤️';
    }

    likeCountElement.textContent = likeCount;

    likeButton.addEventListener('click', () => {
        if (!liked) {
            // If not liked, like it
            liked = true;
            likeCount++;
            likeIcon.textContent = '🖤';
            likeIcon.classList.add('liked'); // Add the 'liked' class
            setTimeout(() => {
                likeIcon.classList.remove('liked'); // Remove the 'liked' class after the animation
            }, 200); // Remove after 200ms to match transition duration
        } else {
            // If already liked, unlike it
            liked = false;
            likeCount--;
            likeIcon.textContent = '❤️';
        }

        // Update the UI and save the status and count to local storage
        likeCountElement.textContent = likeCount;
        setLikedStatus(liked);
        setLikeCount(likeCount);
    });
});
