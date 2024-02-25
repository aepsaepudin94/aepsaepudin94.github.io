const utils = {
  projects: [
    {
      name: 'Transport Management System',
      description: 'Aplikasi komposisi kendaraan berfungi untuk monitoring kendaraan pada setiap wilayah',
      image: 'project-1.png'
    },
    {
      name: 'Bus Wara Wiri',
      description: 'Aplikasi untuk monitoring ketersediaan bus di Ancol dan dilengkapi dengan estimasi kedatangan nya pada setiap halte',
      image: 'project-2.png'
    },
    {
      name: 'Kereta Sato Sato',
      description: 'Aplikasi untuk monitoring ketersediaan kereta di Ancol dan dilengkapi dengan estimasi kedatangan nya pada setiap stasiun',
      image: 'project-3.png'
    }
  ],
  initialize: () => {
    utils.createProjects();
    utils.addAllEventListener();
  },
  createProjects: () => {
    const targetElem = document.querySelector('#project-list');
    let groupingThreeDt = {};
    let n = 0;

    utils.projects.forEach(project => {
      if (!groupingThreeDt[n]) { groupingThreeDt[n] = []; }

      if (groupingThreeDt[n].length < 3) {
        groupingThreeDt[n].push(project);
      } else {
        n++;
        groupingThreeDt[n] = [];
        groupingThreeDt[n].push(project);
      }
    });

    for (const key in groupingThreeDt) {
      if (groupingThreeDt.hasOwnProperty(key)) {
        const group = groupingThreeDt[key];
        const flexDiv = document.createElement('div');
        flexDiv.className = 'flex';
        for (let i = 0; i < group.length; i++) {
          const { name, description, image } = group[i];
          const articleBox = document.createElement('article');
          const img = document.createElement('img');
          const divDescription = document.createElement('div');
          const h3 = document.createElement('h3');
          const p = document.createElement('p');

          articleBox.className = 'box';
          img.src = `assets/images/projects/${image}`;
          img.alt = name;
          divDescription.className = 'project-description';
          h3.innerHTML = name;
          p.innerHTML = description;

          divDescription.appendChild(h3);
          divDescription.appendChild(p);
          articleBox.appendChild(img);
          articleBox.appendChild(divDescription);
          flexDiv.appendChild(articleBox);
        }
        targetElem.appendChild(flexDiv);
      }
    }
  },
  addAllEventListener: () => {
    const iconMenu = document.querySelector('#bar-icon');
    iconMenu.addEventListener('click', (e) => {
      e.preventDefault();
      const navContainer = document.querySelector('.navbar-container');
      const isVisible = navContainer.classList.contains('nav-mobile');

      if (isVisible) {
        navContainer.classList.remove('nav-mobile');
      } else {
        navContainer.classList.add('nav-mobile');
      }
    });

    $('.form-control input, .form-control textarea').on('focus', function() {
      $(this).parent().removeClass('error');
    });

    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = document.querySelector('#name').value;
      const email = document.querySelector('#email').value;
      const phone = document.querySelector('#phone').value;
      const message = document.querySelector('#message').value;

      let isValid = true;

      if (!name) {
        $('#name').parent().addClass('error');
        isValid = false;
      }

      if (!email) {
        $('#email').parent().addClass('error');
        isValid = false;
      }

      if (!message) {
        $('#message').parent().addClass('error');
        isValid = false;
      }

      if (!isValid) return;

      const postData = {
        name    : $.trim(name),
        email   : $.trim(email),
        phone   : $.trim(phone),
        message : $.trim(message)
      };

      const apiUrl = 'https://cakrawala-berlianbuana.com/index.php/api_messages/insert_special_message';

      if ($('.btn-submit').hasClass('disabled')) {
        return;
      }

      $('.btn-submit')
        .addClass('disabled')
        .text('Loading');

      const resetForm = () => {
        $('#name').val('');
        $('#email').val('');
        $('#phone').val('');
        $('#message').val('');
      };

      $.ajax({
        url: apiUrl,
        method: 'POST',
        data: postData,
        success: function (response) {
          const status = response.data;
          if (typeof status == boolean && status) {
            resetForm();
            alert('Thank you for your message!');
          } else {
            alert('Failed to send message!');
          }

          $('.btn-submit')
            .removeClass('disabled')
            .text('Submit');   
        },
        error: function (xhr, status, error) {
          alert('Error: ' + error);
          $('.btn-submit')
            .removeClass('disabled')
            .text('Submit');
        }        
      });      
    });
  }
};

document.addEventListener("DOMContentLoaded", utils.initialize);