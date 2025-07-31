document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const mainContent = app.querySelector('main');
    function getApiUrl(endpoint) {
        // Get current path and ensure we're pointing to the correct API location
        const currentPath = window.location.pathname;
        if (currentPath.includes('/BNIRB/')) {
            // We're in the BNIRB directory, use relative path
            return `./api/${endpoint}`;
        } else if (currentPath.endsWith('/BNIRB')) {
            // We're at /BNIRB without trailing slash, use BNIRB/api path
            return `BNIRB/api/${endpoint}`;
        } else {
            // Fallback - construct absolute path
            return `/BNIRB/api/${endpoint}`;
        }
    }

    // --- STATE MANAGEMENT ---
    let state = {
        members: [],
        filteredMembers: [],
        filters: {
            industries: [],
            categories: []
        },
        currentView: 'list',
        selectedMember: null,
        searchTerm: '',
        selectedIndustry: '',
        selectedCategory: ''
    };

    // --- API CALLS ---
    const api = {
        async fetchAllMembers() {
            try {
                const response = await fetch(getApiUrl('search.php?action=getAll'));
                if (!response.ok) throw new Error('Network response was not ok');
                return await response.json();
            } catch (error) {
                console.error('Error fetching members:', error);
                return [];
            }
        },
        async fetchMemberBySlug(slug) {
            try {
                const response = await fetch(getApiUrl(`search.php?action=getMemberBySlug&slug=${slug}`));
                if (!response.ok) throw new Error('Member not found');
                return await response.json();
            } catch (error) {
                console.error('Error fetching member:', error);
                return null;
            }
        },
        async fetchFilters() {
            try {
                const response = await fetch(getApiUrl('search.php?action=getFilters'));
                if (!response.ok) throw new Error('Network response was not ok');
                return await response.json();
            } catch (error) {
                console.error('Error fetching filters:', error);
                return { industries: [], categories: [] };
            }
        }
    };

    // --- TEMPLATES / RENDERING ---
    const templates = {
        memberCard(member) {
            return `
                <div class="member-card" data-slug="${member.slug}">
                    <h3>${member.member_name}</h3>
                    <p><strong>${member.company_name}</strong></p>
                    <p>${member.industry} / ${member.category}</p>
                </div>
            `;
        },
        memberListView(members) {
            return `
                <div id="controls">
                    <input type="search" id="search-box" placeholder="Search by name, company, keyword..." value="${state.searchTerm}">
                    <div class="filter-group">
                        <select id="industry-filter">
                            <option value="">All Industries</option>
                            ${state.filters.industries.map(i => `<option value="${i}" ${state.selectedIndustry === i ? 'selected' : ''}>${i}</option>`).join('')}
                        </select>
                        <select id="category-filter">
                            <option value="">All Categories</option>
                            ${state.filters.categories.map(c => `<option value="${c}" ${state.selectedCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div id="member-list">
                    ${members.length > 0 ? members.map(this.memberCard).join('') : '<p>No members match the current filters.</p>'}
                </div>
            `;
        },
        memberDetailView(member) {
            return `
                <div id="member-detail">
                    <div class="member-header">
                        <a href="#" class="back-link">&larr; Back to Directory</a>
                        <h2>${member.member_name}</h2>
                        <h3>${member.company_name}</h3>
                        <p>
                            <strong>Industry:</strong> ${member.industry} <br>
                            <strong>Category:</strong> ${member.category}
                        </p>
                        ${member.website ? `<a href="${member.website}" target="_blank" rel="noopener noreferrer">Visit Website</a>` : ''}
                    </div>

                    <div class="member-content">
                        <div class="member-section">
                            <h4>Ideal Referral Profile</h4>
                            <p>${member.ideal_referral_profile}</p>
                        </div>

                        <div class="member-section">
                            <h4>Services</h4>
                            <ul>
                                ${member.services.map(s => `<li>${s}</li>`).join('')}
                            </ul>
                        </div>

                        <div class="member-section">
                            <h4>Referral Keywords</h4>
                            <div class="tags">
                                ${member.referral_keywords.map(k => `<span class="tag">${k}</span>`).join('')}
                            </div>
                        </div>

                        <div class="member-section" id="referral-matches">
                            <h4>Top Referral Partners</h4>
                            <!-- Matches will be rendered here -->
                        </div>
                    </div>
                </div>
            `;
        },
        loadingView() {
            return '<div class="loader">Loading...</div>';
        },
        errorView(message) {
            return `<div class="error">${message}</div>`;
        }
    };

    // --- ROUTER ---
    const router = {
        handleRouteChange() {
            const hash = window.location.hash;
            if (hash.startsWith('#/member/')) {
                const slug = hash.substring(9);
                view.renderMemberDetail(slug);
            } else {
                view.renderMemberList();
            }
        },
        navigateTo(path) {
            window.location.hash = path;
        }
    };

    // --- VIEW / DOM MANIPULATION ---
    const view = {
        async renderMemberList() {
            state.currentView = 'list';
            mainContent.innerHTML = templates.loadingView();
            if (state.members.length === 0) {
                state.members = await api.fetchAllMembers();
            }
            state.filteredMembers = this.filterMembers();
            mainContent.innerHTML = templates.memberListView(state.filteredMembers);
            this.attachListEventListeners();
        },
        async renderMemberDetail(slug) {
            state.currentView = 'detail';
            mainContent.innerHTML = templates.loadingView();
            const member = await api.fetchMemberBySlug(slug);
            state.selectedMember = member;
            if (member) {
                mainContent.innerHTML = templates.memberDetailView(member);
                this.renderReferralMatches(member.referral_matches);
                this.attachDetailEventListeners();
            } else {
                mainContent.innerHTML = templates.errorView('Member not found.');
            }
        },
        renderReferralMatches(matches) {
            const container = document.getElementById('referral-matches');
            if (matches && matches.length > 0) {
                const topMatches = matches.slice(0, 5); // Show top 5
                container.innerHTML += `
                    <div class="referral-list">
                        ${topMatches.map(m => templates.memberCard(m)).join('')}
                    </div>
                `;
            } else {
                container.innerHTML += '<p>No potential referral partners found.</p>';
            }
        },
        filterMembers() {
            const term = state.searchTerm.toLowerCase();
            return state.members.filter(member => {
                const inIndustry = !state.selectedIndustry || member.industry === state.selectedIndustry;
                const inCategory = !state.selectedCategory || member.category === state.selectedCategory;
                const matchesSearch = term === '' || member.search_text.toLowerCase().includes(term);
                return inIndustry && inCategory && matchesSearch;
            });
        },
        updateListView() {
            state.filteredMembers = this.filterMembers();
            const memberListContainer = document.getElementById('member-list');
            memberListContainer.innerHTML = state.filteredMembers.length > 0 
                ? state.filteredMembers.map(templates.memberCard).join('') 
                : '<p>No members match the current filters.</p>';
        },
        attachListEventListeners() {
            const memberList = document.getElementById('member-list');
            if(memberList) {
                memberList.addEventListener('click', (e) => {
                    const card = e.target.closest('.member-card');
                    if (card) {
                        const slug = card.dataset.slug;
                        router.navigateTo(`#/member/${slug}`);
                    }
                });
            }

            const searchBox = document.getElementById('search-box');
            const industryFilter = document.getElementById('industry-filter');
            const categoryFilter = document.getElementById('category-filter');

            searchBox.addEventListener('input', (e) => {
                state.searchTerm = e.target.value;
                this.updateListView();
            });

            industryFilter.addEventListener('change', (e) => {
                state.selectedIndustry = e.target.value;
                this.updateListView();
            });

            categoryFilter.addEventListener('change', (e) => {
                state.selectedCategory = e.target.value;
                this.updateListView();
            });
        },
        attachDetailEventListeners() {
            const backLink = document.querySelector('.back-link');
            backLink.addEventListener('click', (e) => {
                e.preventDefault();
                router.navigateTo('');
            });
            
            const referralList = document.getElementById('referral-matches');
            if(referralList) {
                referralList.addEventListener('click', (e) => {
                    const card = e.target.closest('.member-card');
                    if (card) {
                        e.preventDefault();
                        const slug = card.dataset.slug;
                        router.navigateTo(`#/member/${slug}`);
                    }
                });
            }
        }
    };

    // --- INITIALIZATION ---
    async function init() {
        window.addEventListener('hashchange', router.handleRouteChange);
        const filterData = await api.fetchFilters();
        state.filters = filterData;
        router.handleRouteChange(); // Initial render
    }

    init();
});
