document.addEventListener("DOMContentLoaded", function () {
    // Tập hợp tất cả các phần tử cần sử dụng
    const backTop = document.querySelector("#back-top");
    const stickyHeaderPC = document.querySelector(".js__stickyHeader");
    // search
    const searchContainer = document.querySelector(".js__searchContainer");
    // show sub menu
    const dropdownSubMenu = document.querySelectorAll(".js__dropDown");
    const subMenu = document.querySelector(".js__clickShowMenuMb");
    // muc luc
    const tableOfContents = document.querySelectorAll(".js__tableOfContentItem");
    const tableOfContentBox = document.querySelector(".js__tableOfContentBox");
    const openTableOfContent = document.querySelector(".js__openTableOfContent");
    const closeTableOfContents = document.querySelectorAll(".js__closeTableOfContent");
    // thong tin bo sung
    const provinceTabs = document.querySelector(".js__provinceTabs");
    // trang tim kiem
    const searchResult = document.querySelector(".js__searchResult");

    // Bỏ dấu tiếng Việt để tìm "bao hiem" cũng ra "bảo hiểm"
    function foldText(str) {
        return String(str)
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase();
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    // Xử lý sự kiện khi nhấn nút "back to top"
    function handleBackTop() {
        if (!backTop) return;

        backTop.onclick = function () {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        };
    }

    // Xử lý sự kiện show menu ở handbook (mục lục bên trái)
    function handleTableOfContent() {
        if (!tableOfContents) return;

        tableOfContents.forEach((tableOfContent) => {
            var children = tableOfContent.querySelector(".js__tableOfContentHeading");
            children.onclick = function () {
                tableOfContent.classList.toggle("active");
            };
        });
    }

    // Mở / đóng mục lục dạng ngăn kéo trên màn hình nhỏ
    function handleTableOfContentMb() {
        if (!tableOfContentBox || !openTableOfContent) return;
        var overlay = document.querySelector(".chapter-secondary__overlay");

        function close() {
            tableOfContentBox.classList.remove("active");
            overlay && overlay.classList.remove("active");
            document.querySelector("body").style.overflow = "auto";
        }

        openTableOfContent.onclick = function (e) {
            e.preventDefault();
            tableOfContentBox.classList.add("active");
            overlay && overlay.classList.add("active");
            document.querySelector("body").style.overflow = "hidden";
        };
        closeTableOfContents.forEach((item) => {
            item.onclick = close;
        });
        // bấm vào một câu hỏi trong mục lục thì đóng ngăn kéo
        tableOfContentBox.querySelectorAll(".tableOfContent-dropdown__link").forEach((link) => {
            link.addEventListener("click", function () {
                if (tableOfContentBox.classList.contains("active")) close();
            });
        });
    }

    // Đánh dấu câu hỏi đang đọc trong mục lục
    function handleActiveTableOfContent() {
        if (!tableOfContentBox || !("IntersectionObserver" in window)) return;
        var links = {};
        tableOfContentBox.querySelectorAll('.tableOfContent-item.active a[href^="#"]').forEach((a) => {
            links[a.getAttribute("href").slice(1)] = a;
        });
        var parts = Array.prototype.filter.call(document.querySelectorAll(".part-question[id]"), (p) => links[p.id]);
        if (!parts.length) return;

        var visible = {};
        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach((entry) => {
                    visible[entry.target.id] = entry.isIntersecting;
                });
                var first = parts.filter((p) => visible[p.id])[0];
                if (!first) return;
                tableOfContentBox.querySelectorAll(".tableOfContent-dropdown__link.active").forEach((a) => a.classList.remove("active"));
                links[first.id].classList.add("active");
            },
            { rootMargin: "-110px 0px -55% 0px" }
        );
        parts.forEach((p) => observer.observe(p));
    }

    // Xử lý sự kiện khi nhấn nút search trên thanh navbar
    function handleSearchNavbar() {
        if (!searchContainer) return;

        var searchIcon = searchContainer.querySelector(".js__searchIcon");
        var closeSearch = searchContainer.querySelector(".js__closeSearch");
        var searchInput = searchContainer.querySelector(".js__searchInput");

        searchIcon.onclick = function () {
            searchContainer.classList.add("active");
            searchInput.focus();
        };
        closeSearch.onclick = function () {
            if (searchContainer.closest(".active")) {
                searchContainer.classList.remove("active");
                searchInput.value = "";
            }
        };
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") closeSearch.onclick();
        });
    }

    // xử lý sự kiện để show sub menu
    function handleShowSubMenu() {
        if (!subMenu) return;
        var closeSubMenu = document.querySelector(".js__closeSubMenu");
        var overlay = document.querySelector(".js__overlay");
        var parentBox = subMenu.parentElement;

        subMenu.onclick = function () {
            this.parentElement.classList.add("active");
            document.querySelector("body").style.overflow = "hidden";
        };
        closeSubMenu.onclick = function () {
            parentBox.classList.remove("active");
            document.querySelector("body").style.overflow = "auto";
        };
        overlay.onclick = function () {
            parentBox.classList.remove("active");
            document.querySelector("body").style.overflow = "auto";
        };
    }

    // Xử lý sự kiện để show dropdown submenu
    function handleShowDropdownSubMenu() {
        dropdownSubMenu &&
            dropdownSubMenu.forEach((item) => {
                var parent = item.parentElement;
                var nextEle = parent.querySelector(".js__listSubMenu");
                item.onclick = function (e) {
                    // bấm vào mũi tên thì mở danh sách, bấm vào chữ thì đi tới trang
                    if (e.target.closest("a")) return;
                    parent.classList.toggle("active");
                    if (nextEle.style.maxHeight) {
                        nextEle.style.maxHeight = null;
                    } else {
                        nextEle.style.maxHeight = nextEle.scrollHeight + "px";
                    }
                };
            });
    }

    // Tab tỉnh / thành ở trang thông tin bổ sung
    function handleProvinceTabs() {
        if (!provinceTabs) return;
        var buttons = provinceTabs.querySelectorAll(".province-tabs__btn");

        function show(id) {
            buttons.forEach((btn) => btn.classList.toggle("active", btn.dataset.target === id));
            document.querySelectorAll(".province-panel").forEach((panel) => panel.classList.toggle("active", panel.id === id));
        }
        buttons.forEach((btn) => {
            btn.onclick = function () {
                show(btn.dataset.target);
            };
        });
        // mở đúng tab khi đi từ mục lục (#thong-tin-bo-sung__3...)
        function fromHash() {
            var id = location.hash.slice(1);
            if (document.querySelector('.province-panel[id="' + id + '"]')) show(id);
        }
        window.addEventListener("hashchange", fromHash);
        fromHash();
    }

    // Trang tìm kiếm: lọc câu hỏi theo từ khoá (không cần máy chủ)
    function handleSearchPage() {
        if (!searchResult || !window.SEARCH_DATA) return;
        var input = document.querySelector(".js__searchPageInput");
        var hint = document.querySelector(".js__searchHint");
        var keyword = new URLSearchParams(location.search).get("s") || "";
        input.value = keyword;

        var words = foldText(keyword).split(/\s+/).filter((w) => w.length > 1 || /\d/.test(w));
        if (!words.length) return;

        var number = /^\d+$/.test(keyword.trim()) ? +keyword.trim() : null;
        var hits = window.SEARCH_DATA.map((item) => {
            if (number !== null && item.n === number) return { item: item, score: 1000 };
            var title = foldText(item.q);
            var all = "cau " + item.n + " " + title + " " + foldText(item.a);
            var score = 0;
            for (var i = 0; i < words.length; i++) {
                if (all.indexOf(words[i]) === -1) return null;
                score += title.indexOf(words[i]) !== -1 ? 10 : 1;
            }
            return { item: item, score: score };
        })
            .filter(Boolean)
            .sort((a, b) => b.score - a.score);

        // tô vàng từ khoá (vị trí trên chuỗi bỏ dấu trùng với chuỗi gốc)
        function highlight(text) {
            var folded = foldText(text);
            var marks = [];
            words.forEach((w) => {
                var i = 0;
                while ((i = folded.indexOf(w, i)) !== -1) {
                    marks.push([i, i + w.length]);
                    i += w.length;
                }
            });
            marks.sort((a, b) => a[0] - b[0]);
            var out = "";
            var pos = 0;
            marks.forEach((m) => {
                if (m[0] < pos) return;
                out += escapeHtml(text.slice(pos, m[0])) + "<mark>" + escapeHtml(text.slice(m[0], m[1])) + "</mark>";
                pos = m[1];
            });
            return out + escapeHtml(text.slice(pos));
        }

        function snippet(text) {
            var i = foldText(text).indexOf(words[0]);
            var start = Math.max(0, i - 60);
            return (start > 0 ? "…" : "") + text.slice(start, start + 200) + (start + 200 < text.length ? "…" : "");
        }

        hint.textContent = hits.length + " kết quả cho “" + keyword + "”";
        if (!hits.length) {
            searchResult.innerHTML = '<p class="result-empty">Không tìm thấy câu hỏi phù hợp. Hãy thử từ khoá khác.</p>';
            return;
        }
        searchResult.innerHTML = hits
            .map((hit) => {
                var item = hit.item;
                return (
                    '<div class="result-item result-item--' + item.k + '">' +
                    '<span class="result-item__tag">' + escapeHtml(item.c) + " · Câu " + item.n + "</span>" +
                    '<a href="' + item.u + '" class="result-item__link1">' + highlight(item.q) + "</a>" +
                    '<p class="result-item__des">' + highlight(snippet(item.a)) + "</p>" +
                    '<div class="result-item__bot"><a href="' + item.u + '" class="result-item__link3">Xem câu trả lời</a></div>' +
                    "</div>"
                );
            })
            .join("");
    }

    // Xử lý thanh header dính: giữ chỗ để nội dung không bị giật lên
    function handleStickyHeader() {
        if (stickyHeaderPC) {
            const isSticky = scrollY > 100;
            if (isSticky === stickyHeaderPC.classList.contains("sticky")) return;
            document.body.style.paddingTop = isSticky ? stickyHeaderPC.offsetHeight + "px" : "";
            stickyHeaderPC.classList.toggle("sticky", isSticky);
        }
    }

    // Hàm hiển thị nút backTop dựa trên vị trí cuộn trang
    function handleBackTopVisibility() {
        if (backTop) {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                backTop.style.opacity = 1;
                backTop.style.visibility = "visible";
            } else {
                backTop.style.opacity = 0;
                backTop.style.visibility = "hidden";
            }
        }
    }

    // Xử lý sự kiện khi cuộn trang
    function handleWindowScroll() {
        window.onscroll = function () {
            handleStickyHeader();
            handleBackTopVisibility();
        };
    }

    // Khởi tạo tất cả các chức năng
    function initApp() {
        handleBackTop();
        handleShowSubMenu();
        handleShowDropdownSubMenu();
        handleTableOfContent();
        handleTableOfContentMb();
        handleActiveTableOfContent();
        handleProvinceTabs();
        handleSearchPage();
        // scroll
        handleWindowScroll();
        handleStickyHeader();
        handleSearchNavbar();
    }

    // Bắt đầu khởi tạo ứng dụng
    initApp();
});
