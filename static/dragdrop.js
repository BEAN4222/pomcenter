fetchImage().then(() => {
  return fetchImage();
}).then(() => {
  displayFirstOne();
});


let currentYear = 0;
let life = 3;
let score = 0;
var item = document.querySelector('.item');
function handleDragStart(event) {
    if (event.target.classList.contains('item')) {
      setTimeout(() => event.target.classList.add("dragging"), 0);
    } else {
      event.preventDefault();
    }
}
item.addEventListener('dragstart', handleDragStart);
item.addEventListener('touchstart', handleDragStart);

const sortableList = document.querySelector(".bottom");
let isDragging = false;
let startX, scrollLeft;


// 터치 이벤트 리스너 추가
sortableList.addEventListener('touchstart', dragStart);
sortableList.addEventListener('touchend', dragEnd);
sortableList.addEventListener('touchmove', drag);

// 마우스 이벤트 리스너 추가 (PC용)
sortableList.addEventListener('mousedown', dragStart);
sortableList.addEventListener('mouseup', dragEnd);
sortableList.addEventListener('mouseleave', dragEnd);
sortableList.addEventListener('mousemove', drag);

function dragStart(e) {
  isDragging = true;
  startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
  scrollLeft = sortableList.scrollLeft;
  
  // 드래그 시작 시 커서 스타일 변경
  sortableList.style.cursor = 'grabbing';
  sortableList.style.userSelect = 'none';
}

function dragEnd() {
  isDragging = false;
  
  // 드래그 종료 시 커서 스타일 원복
  sortableList.style.cursor = 'grab';
  sortableList.style.userSelect = '';
}

function drag(e) {
  if (!isDragging) return;
  e.preventDefault();
  const x = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
  const walk = (x - startX) * 2; // 스크롤 속도 조절
  sortableList.scrollLeft = scrollLeft - walk;
}

const items = sortableList.querySelectorAll(".item");
const initSortableList = (e) => {
  if (isDragging) return;
  e.preventDefault();
  const draggingItem = document.querySelector(".dragging");
  if (!draggingItem) return;

  let pageX;
  if (e.type === 'touchmove') {
    pageX = e.touches[0].pageX;
  } else {
    pageX = e.pageX;
  }

  let siblings = [...sortableList.querySelectorAll(".item:not(.dragging)")];
  let nextSibling = siblings.find(sibling => {
    return pageX <= sibling.offsetLeft - sortableList.scrollLeft + sibling.offsetWidth / 2;
  });

  // 자동 스크롤 기능 추가
  const containerRect = sortableList.getBoundingClientRect();
  const scrollThreshold = 50; // 스크롤 시작 임계값

  if (pageX - containerRect.left < scrollThreshold) {
    // 왼쪽 끝에 가까워지면 왼쪽으로 스크롤
    sortableList.scrollLeft -= 10;
  } else if (containerRect.right - pageX < scrollThreshold) {
    // 오른쪽 끝에 가까워지면 오른쪽으로 스크롤
    sortableList.scrollLeft += 10;
  }

  sortableList.insertBefore(draggingItem, nextSibling);
}

const handleDragLeave = (e) => {
  const draggingItem = document.querySelector(".dragging");
  if (e.currentTarget.contains(e.relatedTarget)) return;
  const top = document.querySelector(".top");
  top.insertBefore(draggingItem, top.firstChild);
}

const handleDrop = (e) => {
  e.preventDefault();
  
  let pageX;
  if (e.type === 'touchend') {
    pageX = e.changedTouches[0].pageX;
  } else {
    pageX = e.pageX;
  }

  const droppedElement = document.querySelector(".dragging");
  if (droppedElement && droppedElement.classList.contains("item")) {
    const droppedIndex = droppedElement.querySelector('.description p').dataset.index;
    delay(270).then(() => {
      return fetchDate(droppedIndex);
    }).then((result) => {
      const dropDateLink = result;
      const dateElement = document.createElement('p');
      dateElement.textContent = `${dropDateLink[0]}`;
      dateElement.classList.add('date');
      droppedElement.querySelector('.description').appendChild(dateElement);

      const linkElement = document.createElement('a');
      linkElement.href = `${dropDateLink[1]}`;
      linkElement.target = '_blank';
      linkElement.classList.add('link');
      linkElement.textContent = "보러가기";
      linkElement.addEventListener('touchstart', (event) => {
        window.open(linkElement.href, '_blank');
        event.preventDefault();
      });
      droppedElement.querySelector('.description').appendChild(linkElement);

      currentYear = parseInt(droppedElement.querySelector('.description .date').textContent);
      let siblings = [...sortableList.querySelectorAll(".item:not(.dragging)")];
      let reversedSiblings = [...siblings].reverse();

      droppedElement.classList.remove("dragging");
      droppedElement.setAttribute('draggable', 'false');
      droppedElement.removeEventListener('dragstart', handleDragStart);
      droppedElement.removeEventListener('touchstart', handleDragStart);
      const top = document.querySelector(".top");
      const newDiv = document.createElement('div');
      newDiv.setAttribute('class', 'item available');
      newDiv.setAttribute('draggable', 'true');
      newDiv.innerHTML = `
        <img class="item_img" alt="Random Image">
        <div class="description"></div>
      `;

      let scoreflag = true;

      let nextSibling = siblings.find(sibling => {
        return pageX <= sibling.offsetLeft - sortableList.scrollLeft + sibling.offsetWidth / 2;
      });
      let prevSibling = reversedSiblings.find(sibling => {
        return pageX >= sibling.offsetLeft - sortableList.scrollLeft + sibling.offsetWidth / 2;
      });

      if (nextSibling) {
        let nextSiblingYear = parseInt(nextSibling.querySelector('.description .date').textContent);
        console.log(nextSibling)
        if (nextSiblingYear < currentYear) {
          scoreflag = false;
          nextSibling = siblings.find(sibling => {
            nextSiblingYear = sibling.querySelector('.description .date').textContent;
            return nextSiblingYear > currentYear;
          });
          sortableList.insertBefore(droppedElement, nextSibling);
        }
      }

      if (prevSibling) {
        let prevSiblingYear = parseInt(prevSibling.querySelector('.description .date').textContent);
        if (prevSiblingYear > currentYear) {
          scoreflag = false;
          prevSibling = reversedSiblings.find(sibling => {
            prevSiblingYear = sibling.querySelector('.description .date').textContent;
            return prevSiblingYear < currentYear;
          });
          if (prevSibling) {
            sortableList.insertBefore(droppedElement, prevSibling.nextSibling);
          } else {
            sortableList.insertBefore(droppedElement, sortableList.firstChild);
          }
        }
      }

      if (scoreflag !== true) {
        life -= 1;
        if (life == 0) {
          scoreflag = true;
          let modal = document.getElementById("myModal");
          modal.style.display = "block";
          if (score == 0) {
            document.querySelector(".phrase").textContent = "역사를 잊은 민족에게 미래는 없습니다";
        } else if (score < 3) {
            document.querySelector(".phrase").textContent = "역사의 첫 걸음";
        } else if (score < 5) {
            document.querySelector(".phrase").textContent = "역사 입문자";
        } else if (score < 10) {
            document.querySelector(".phrase").textContent = "역사에 관심이 생기는 단계";
        } else if (score < 15) {
            document.querySelector(".phrase").textContent = "역사 지식이 쌓여가는 중";
        } else if (score < 18) {
            document.querySelector(".phrase").textContent = "역사 박사 수준";
        } else if (score > 17) {
            document.querySelector(".phrase").textContent = "당신은 살아있는 역사책입니다!";
        }

          document.getElementById("replay").onclick = function () {
            modal.style.display = "none";
            location.reload();
          }
          return;
        }
      } else {
        score += 1;
        document.querySelector(".score").textContent = score;
      }

      top.appendChild(newDiv);
      var newItem = document.querySelector('.item.available');
      newItem.addEventListener('dragstart', handleDragStart);
      newItem.addEventListener('touchstart', handleDragStart);
      fetchImage();

      if (life == 2) {
        document.querySelector(".life").textContent = "❤️❤️";
      } else if (life == 1) {
        document.querySelector(".life").textContent = "❤️";
      }
    }).catch((error) => {
      console.error(error);
    });
  }
};

sortableList.addEventListener("dragover", initSortableList);
sortableList.addEventListener("dragleave", handleDragLeave);
sortableList.addEventListener("drop", handleDrop);

sortableList.addEventListener("touchmove", (e) => {
  if (!isDragging) initSortableList(e);
});
document.addEventListener("touchmove",initSortableList);
sortableList.addEventListener("touchleave", handleDragLeave);
sortableList.addEventListener("touchend", handleDrop);

function fetchImage() {
  return new Promise((resolve, reject) => {
    let availableElement;
    fetch(`/img`)
      .then(response => response.json())
      .then(data => {
        let history = data[0];
        let resultindex = data[1];
        if (history.error) {
          let modal = document.getElementById("myModal");
          modal.style.display = "block";
          document.querySelector(".phrase").innerHTML = "불가능한 업적을 달성하셨습니다!, 경의를 표합니다"
          document.getElementById("replay").onclick = function () {
            modal.style.display = "none";
            location.reload();
          }
        }
        const name = history.nameofcase;
        const img = history.img

        availableElement = document.querySelector('.available');
        if (availableElement) {
          const titleElement = document.createElement('p');
          titleElement.setAttribute('data-index', resultindex)
          titleElement.textContent = `${name}`;
          availableElement.querySelector('.description').appendChild(titleElement);
        }

        if (availableElement) {
          const imageElement = availableElement.querySelector('.item_img');
          if (imageElement) {
            imageElement.src = img;
          }
        }
        availableElement.classList.remove("available")
        resolve();
      })
      .catch(error => {
        reject(error);
      });
  });
};

function fetchDate(resultindex) {
  return new Promise((resolve, reject) => {
    fetch(`/date?index=${resultindex}`)
      .then(response => response.json())
      .then(data => {
        let date = data[0];
        let link = data[1];
        resolve([date, link]);
      })
      .catch(error => {
        console.log("음 에러야 시발 왜지");
        reject(error);
      });
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function displayFirstOne() {
  let firstone = document.querySelector('.bottom .item');
  let firstdescription = firstone.querySelector('.description');
  let firstindex = firstdescription.querySelector('p');
  let firstonedatelink;
  firstindex = firstindex.dataset.index;

  delay(270).then(() => {
    return fetchDate(firstindex);
  }).then((result) => {
    firstonedatelink = result;

    const dateElement = document.createElement('p');
    dateElement.textContent = `${firstonedatelink[0]}`;
    dateElement.classList.add('date');
    firstone.querySelector('.description').appendChild(dateElement);

    const linkElement = document.createElement('a');
    linkElement.href = `${firstonedatelink[1]}`;
    linkElement.target = '_blank';
    linkElement.classList.add('link');
    linkElement.textContent = "보러가기";
    linkElement.addEventListener('touchstart', (event) => {
      window.open(linkElement.href, '_blank');
      event.preventDefault();
    });
    firstone.querySelector('.description').appendChild(linkElement);
  }).catch((error) => {
    console.error(error);
  });
}
