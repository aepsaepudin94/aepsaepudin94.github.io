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
  }
};

document.addEventListener("DOMContentLoaded", utils.initialize);