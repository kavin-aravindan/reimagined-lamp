document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Terms of Service (TOS) Prompt ---
  const initTOS = () => {
    // If TOS was already accepted, do not show it
    const acceptedTOS = localStorage.getItem("accepted_tos") === "20241119";
    if (acceptedTOS) return;

    // Wait 1.5 seconds to show the TOS prompt as in the original layout
    setTimeout(() => {
      // Create and prepend the TOS Prompt markup to body
      const tosDiv = document.createElement("div");
      tosDiv.id = "tos_prompt";
      tosDiv.className = "tos-active"; // Use a class we'll style for visibility
      tosDiv.innerHTML = `
        <h2 class="heading">
          <span>Archive of Our Own</span>
        </h2>
        <div class="agreement">
          <p>
            On the Archive of Our Own (AO3), users can create works, bookmarks, comments, tags, and other <a href="../../index.html">Content</a>. Any information you publish on AO3 may be accessible by the public, AO3 users, and/or AO3 personnel. Be mindful when sharing personal information, including but not limited to your name, email, age, location, personal relationships, gender or sexual identity, racial or ethnic background, religious or political views, and/or account usernames for other sites.
          </p>
          <p>
            To learn more, check out our <a href="../../index.html">Terms of Service</a>, including the <a href="../../index.html">Content Policy</a> and <a href="../../index.html">Privacy Policy</a>.
          </p>

          <p class="confirmation">
            <input type="checkbox" id="tos_agree" />
            <label for="tos_agree">I have read &amp; understood the 2024 Terms of Service, including the Content Policy and Privacy Policy.</label>
          </p>

          <p class="confirmation">
            <input type="checkbox" id="data_processing_agree" />
            <label for="data_processing_agree">By checking this box, you consent to the processing of your personal data in the United States and other jurisdictions in connection with our provision of AO3 and its related services to you. You acknowledge that the data privacy laws of such jurisdictions may differ from those provided in your jurisdiction. For more information about how your personal data will be processed, please refer to our Privacy Policy.</label>
          </p>

          <p class="submit">
            <button name="button" type="button" id="accept_tos" disabled>I agree/consent to these Terms</button>
          </p>
        </div>
      `;

      document.body.prepend(tosDiv);
      document.body.style.overflow = "hidden";

      // Setup actions
      const tosCheckbox = document.getElementById("tos_agree");
      const dataProcessingCheckbox = document.getElementById("data_processing_agree");
      const acceptBtn = document.getElementById("accept_tos");

      // Ensure elements are active and not disabled
      tosCheckbox.disabled = false;
      dataProcessingCheckbox.disabled = false;

      const checkAgreement = () => {
        acceptBtn.disabled = !tosCheckbox.checked || !dataProcessingCheckbox.checked;
      };

      tosCheckbox.addEventListener("change", checkAgreement);
      dataProcessingCheckbox.addEventListener("change", checkAgreement);

      acceptBtn.addEventListener("click", () => {
        localStorage.setItem("accepted_tos", "20241119");
        document.body.style.overflow = "";
        tosDiv.style.opacity = "0";
        setTimeout(() => tosDiv.remove(), 500); // fade out and remove
      });
    }, 1500);
  };

  // --- 2. Small Login Form Toggle ---
  const initLoginToggle = () => {
    const loginLink = document.getElementById("login-dropdown");
    const userActions = loginLink ? loginLink.closest(".user.actions") : null;
    const loginBox = document.getElementById("small_login");

    if (loginLink && userActions && loginBox) {
      // Remove any inline style that hides it initially, we will manage display
      loginBox.style.display = "";

      loginLink.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        userActions.classList.toggle("open");
      });

      // Close login dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!userActions.contains(e.target) && !loginBox.contains(e.target)) {
          userActions.classList.remove("open");
        }
      });
    }
  };

  // --- 3. Kudos Interactive System ---
  let baseKudosCount = 142; // Authentic reader kudos count
  const renderKudosList = (hasUserKudo) => {
    const kudosContainer = document.getElementById("kudos");
    if (!kudosContainer) return;

    if (hasUserKudo) {
      kudosContainer.innerHTML = `
        <p class="kudos">
          <strong>you</strong>, 
          <a href="../../index.html">Gojo_Satoru</a>, 
          <a href="../../index.html">Yue_Nanaka</a>, 
          <a href="../../index.html">Shoko_Ieiri</a>, 
          <a href="../../index.html">Maki_Z</a>, and 
          <a href="../../index.html">${baseKudosCount} other users</a> left kudos on this work!
        </p>
      `;
    } else {
      kudosContainer.innerHTML = `
        <p class="kudos">
          <a href="../../index.html">Gojo_Satoru</a>, 
          <a href="../../index.html">Yue_Nanaka</a>, 
          <a href="../../index.html">Shoko_Ieiri</a>, 
          <a href="../../index.html">Maki_Z</a>, and 
          <a href="../../index.html">${baseKudosCount} other users</a> left kudos on this work!
        </p>
      `;
    }
  };

  const initKudos = () => {
    const kudoSubmit = document.getElementById("kudo_submit");
    const kudoForm = document.getElementById("new_kudo");
    const kudosMessage = document.getElementById("kudos_message");

    if (kudoSubmit && kudoForm) {
      // Enable inputs for local interactivity
      kudoSubmit.removeAttribute("disabled");
      Array.from(kudoForm.querySelectorAll("input")).forEach(input => input.removeAttribute("disabled"));

      let hasKudosed = localStorage.getItem("kudos_left_85935826") === "true";
      renderKudosList(hasKudosed);

      if (hasKudosed) {
        kudoSubmit.disabled = true;
        kudoSubmit.value = "Kudos ♥ (Already Left)";
      }

      kudoForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (localStorage.getItem("kudos_left_85935826") === "true") return;

        localStorage.setItem("kudos_left_85935826", "true");
        kudoSubmit.disabled = true;
        kudoSubmit.value = "Kudos ♥ (Already Left)";
        kudoSubmit.classList.add("kudosed-heartbeat"); // trigger heartbeat animation
        
        renderKudosList(true);

        if (kudosMessage) {
          kudosMessage.innerHTML = '<p class="kudos-success">Thank you for leaving kudos!</p>';
        }
      });
    }
  };

  // --- 4. Comments Accordion and Submission ---
  let commentsData = [
    {
      id: "comment_1",
      author: "Gojo_Satoru",
      date: "2026-06-01 21:05",
      content: "Naoya getting dragged on his own podcast is the best thing that happened this week. 10/10 beef, would read again. Yue, you absolute legend."
    },
    {
      id: "comment_2",
      author: "Naoya_Zenin",
      date: "2026-06-01 21:15",
      content: "Delete this immediately. The Yue clan will hear of this blatant disrespect. Podcast was edited out of context anyway."
    },
    {
      id: "comment_3",
      author: "Maki_Z",
      date: "2026-06-01 21:30",
      content: "Hahaha Naoya you pathetic worm. Complaining about 'independent' women while whining on the internet. Nanaka Yue is my hero."
    },
    {
      id: "comment_4",
      author: "JJK_Fan_99",
      date: "2026-06-01 22:01",
      content: "ARRANGED MARRIAGE TROPES YESSSS. The enemies to lovers tension is already so high! Please update soon author!!! :D"
    }
  ];

  const renderComments = () => {
    const container = document.getElementById("comments_placeholder");
    if (!container) return;

    let commentsHTML = `
      <h3 class="heading">Comments (${commentsData.length})</h3>
      <ol class="thread">
    `;

    commentsData.forEach(c => {
      // Use standard AO3 class structure so styles apply automatically
      commentsHTML += `
        <li class="comment group" id="${c.id}" role="article">
          <div class="icon">
            <span class="comment-avatar-fallback">${c.author.slice(0,2).toUpperCase()}</span>
          </div>
          <div class="header">
            <h4 class="heading">
              <a href="../../index.html">${c.author}</a>
            </h4>
            <span class="posted datetime">${c.date}</span>
          </div>
          <div class="userstuff">
            <p>${c.content}</p>
          </div>
          <ul class="actions" role="menu">
            <li><a href="../../index.html">Reply</a></li>
            <li><a href="../../index.html">Thread</a></li>
          </ul>
        </li>
      `;
    });

    commentsHTML += `
      </ol>

      <!-- Custom comment submission form -->
      <form class="new_comment" id="new_comment_form" action="#" style="margin-top: 2em; padding: 1.5em; border: 1px solid #ddd; background: #fdfdfd; border-radius: 4px;">
        <h4 class="heading" style="border-bottom: 1px solid #ccc; padding-bottom: 0.5em; margin-bottom: 1em;">Add a Comment</h4>
        <dl style="border: none; padding: 0;">
          <dt style="margin-bottom: 0.5em;"><label for="comment_author_input">Name (Optional):</label></dt>
          <dd style="margin-bottom: 1em; margin-left: 0;"><input type="text" id="comment_author_input" placeholder="Guest" style="width: 100%; max-width: 300px; padding: 0.5em; border: 1px solid #ccc; border-radius: 3px;" /></dd>
          <dt style="margin-bottom: 0.5em;"><label for="comment_content_input">Comment:</label></dt>
          <dd style="margin-bottom: 1em; margin-left: 0;"><textarea id="comment_content_input" required placeholder="Type your comment here..." style="width: 100%; min-height: 100px; padding: 0.5em; border: 1px solid #ccc; border-radius: 3px; font-family: inherit; resize: vertical;"></textarea></dd>
        </dl>
        <p class="submit actions" style="margin-top: 1em;">
          <input type="submit" value="Post Comment" id="post_comment_btn" style="background: #900; color: #fff; border: 1px solid #730000; padding: 0.5em 1.5em; font-weight: bold; cursor: pointer; border-radius: 4px;" />
        </p>
      </form>
    `;

    container.innerHTML = commentsHTML;

    // Attach comments post handler
    const form = document.getElementById("new_comment_form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const authorInput = document.getElementById("comment_author_input");
        const contentInput = document.getElementById("comment_content_input");

        const authorName = authorInput.value.trim() || "Guest";
        const content = contentInput.value.trim();

        if (!content) return;

        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        commentsData.push({
          id: `comment_${commentsData.length + 1}`,
          author: authorName,
          date: formattedDate,
          content: content
        });

        // Re-render and update counts
        renderComments();
        updateCommentCounts();
      });
    }
  };

  const updateCommentCounts = () => {
    // Update comments counts in nav links
    const topLink = document.getElementById("show_comments_link_top");
    const bottomLink = document.getElementById("show_comments_link");

    if (topLink) {
      topLink.querySelector("a").innerText = `Comments (${commentsData.length})`;
    }
    if (bottomLink) {
      bottomLink.querySelector("a").innerText = `Comments (${commentsData.length})`;
    }
  };

  const initCommentsToggle = () => {
    const topLink = document.getElementById("show_comments_link_top");
    const bottomLink = document.getElementById("show_comments_link");
    const commentsPlaceholder = document.getElementById("comments_placeholder");

    // Initialize counts and render comments
    updateCommentCounts();
    renderComments();

    const toggleComments = (e) => {
      e.preventDefault();
      if (!commentsPlaceholder) return;

      const isHidden = commentsPlaceholder.style.display === "none";
      if (isHidden) {
        commentsPlaceholder.style.display = "block";
        commentsPlaceholder.scrollIntoView({ behavior: "smooth" });
      } else {
        commentsPlaceholder.style.display = "none";
      }
    };

    if (topLink) topLink.addEventListener("click", toggleComments);
    if (bottomLink) bottomLink.addEventListener("click", toggleComments);
  };

  // Run initializers
  initTOS();
  initLoginToggle();
  initKudos();
  initCommentsToggle();
});