import React from "react";
import ReactDOM from "react-dom";
import "./style.css";

function Article(props) {
	return (
		<div>
			{ props.withNum ? <span>{props.no}.</span> : null}&nbsp;
			<a href={props.link}>{props.title}</a>
			{ props.withDate ? <span>({props.date})</span> : null }
		</div>
	);
}

function Step2(props) {
	if (props.currentStep !== 2) {
		return null;
	}

	let display;

	switch (props.articles) {
		case 0:
			display = "什么都没抓到。";
			break;
		case -1:
			display = "程序出错了，或许是此用户不存在。";
			break;
		default:
			const { startDate, endDate, withNum, withDate, sortDateAsc } = props.edit;
			let articles = props.articles.sort((a, b) => (sortDateAsc ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)));

			if (startDate !== "") articles = articles.filter((article) => article.date > startDate);
			if (endDate !== "") articles = articles.filter((article) => article.date < endDate);

			display = articles.map((a, index) => <Article key={index} link={a.link} title={a.title} date={a.date.slice(0, 10)} no={index + 1} withNum={withNum} withDate={withDate} />);
			break;
	}

	return (
		<div>
			<div className="step2EditPanel">
				<div className="stepRow">
						<div className="step2EditSet">
						<input type="checkbox" name="withNum" id="withNum" checked={props.edit.withNum} onChange={props.handleEdit} />
						<label htmlFor="withNum">加序号</label>
					</div>
					<div className="step2EditSet">
						<input type="checkbox" name="withDate" id="withDate" checked={props.edit.withDate} onChange={props.handleEdit} />
						<label htmlFor="withDate">加日期</label>
					</div>
					<div className="step2EditSet">
						<input type="checkbox" name="sortDateAsc" id="sortDateAsc" checked={props.edit.sortDateAsc} onChange={props.handleEdit} />
						<label htmlFor="sortDateAsc">排序新到旧</label>
					</div>
				</div>

				<div className="stepRow">
					<label htmlFor="startDate">只要日期介于：</label>
					<input type="date" name="startDate" value={props.edit.startDate} onChange={props.handleEdit} />
					<label htmlFor="endDate">到</label>
					<input type="date" name="endDate" value={props.edit.endDate} onChange={props.handleEdit} />
				</div>
			</div>

			<div id="articles" className="articles">{display}</div>

			<button className="stepBtn" onClick={props.goBackToStepOne}>
				🥕上一步
			</button>
			
			<button id="btnCopy" className="stepBtn" onClick={props.copyToClipBoard}>
				🐚拷贝
			</button>
		</div>
	);
}

function Step1(props) {
	if (props.currentStep !== 1) {
		return null;
	}

	return (
		<form>
			<div className="stepRow">
				<label>
					用户名
					<input type="text" name="userName" onChange={props.handleInput} value={props.userInfo.userName} required />
				</label>
			</div>

			<div className="stepRow">
				<label>
					文章数量
					<input type="number" name="first" onChange={props.handleInput} value={props.userInfo.first} />
				</label>
			</div>

			<button className="stepBtn" onClick={props.grabPosts}>
				🥔抓!
			</button>
		</form>
	);
}

class Matalogue extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currentStep: 1,
			userInfo: {
				userName: "",
				first: 20,
			},
			edit: {
				startDate: "",
				endDate: "",
				withNum: true,
				withDate: true,
				sortDateAsc: true,
			},
			articles: 0
		};

		this.grabPosts = this.grabPosts.bind(this);
		this.handleEdit = this.handleEdit.bind(this);
		this.handleInput = this.handleInput.bind(this);
		this.goBackToStepOne = this.goBackToStepOne.bind(this);
		this.copyToClipBoard = this.copyToClipBoard.bind(this);
	}

	grabPosts(event) {
		if (this.state.userInfo.userName.length <= 0) {
			return;
		}

		const { userName, first } = this.state.userInfo;
		const content = document.getElementById("contentBox");
		const fetchURL = "https://arcane-lake-88529.herokuapp.com/https://server.matters.news/graphql";
		const fetchQuery = `
			query ($userName: String!, $first: Int!) {
				user(input: { userName: $userName }) {
					articles(input: { first: $first }) {
						edges {
							node {
								title
								slug
								mediaHash
								createdAt
							}
						}
					}
				}
			}
		`;
		const header = { "Content-Type": "application/json" };
		const body = JSON.stringify({
			query: fetchQuery,
			variables: {
				userName: userName,
				first: parseInt(first),
			},
		});

		event.preventDefault();
		content.classList.add("waiting");

		fetch(fetchURL, {
			method: "POST",
			headers: header,
			body: body,
		})
			.then((res) => res.json())
			.then((result) => {
				content.classList.remove("waiting");
				let user = result.data.user;
				let fetchedArticles;

				if (!user) {
					fetchedArticles = -1;
				} else {
					fetchedArticles = user.articles.edges;

					if (fetchedArticles.length === 0) {
						fetchedArticles = 0;
					} else {
						fetchedArticles = fetchedArticles.map((article) => (
							{ 
								date: article.node.createdAt, 
								link: `https://matters.news/@${userName}/${article.node.slug}-${article.node.mediaHash}`, 
								title: article.node.title 
							}
						));
					}
				}

				this.setState({ currentStep: 2, articles: fetchedArticles });
			})
			.catch((err) => console.error(err));
	}

	handleEdit(event) {
		const target = event.target;
		const value = target.type === "checkbox" ? target.checked : target.value;
		const name = target.name;
		let newEdit = this.state.edit;
		newEdit[name] = value;
		this.setState({ edit: newEdit });
	}

	handleInput(event) {
		const { name, value } = event.target;
		let newInfo = this.state.userInfo;
		newInfo[name] = value;
		this.setState({ userInfo: newInfo });
	}

	goBackToStepOne() {
		this.setState({ currentStep: 1 });
	}

	copyToClipBoard() {
		const articles = document.getElementById("articles");
		const btnCopy = document.getElementById("btnCopy");
		let r = document.createRange();
		r.selectNode(articles);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(r);
		document.execCommand('copy');
		window.getSelection().removeAllRanges();
		btnCopy.classList.add("shake");
		setTimeout(()=>{btnCopy.classList.remove("shake")}, 400)
	}

	render() {
		return (
			<div className="matalogue">
				<header>
					<h1>Matalogue</h1>
				</header>

				<div id="contentBox" className="content">
					<Step1 
						currentStep = { this.state.currentStep } 
						userInfo = { this.state.userInfo } 
						handleInput = { this.handleInput } 
						grabPosts = { this.grabPosts } 
					/>
					<Step2 
						currentStep = { this.state.currentStep } 
						articles = { this.state.articles } 
						edit = { this.state.edit } 
						handleEdit = { this.handleEdit } 
						goBackToStepOne = { this.goBackToStepOne } 
						copyToClipBoard = { this.copyToClipBoard }
					/>
				</div>

				<footer>
					<button>
						<a href="#">🧄使用方法</a>
					</button>
				</footer>
			</div>
		);
	}
}

ReactDOM.render(<Matalogue />, document.getElementById("root"));
