import React from "react";
import ReactDOM from "react-dom";
import "./style.css";
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from "@apollo/client";

const client = new ApolloClient({
	uri: "https://arcane-lake-88529.herokuapp.com/https://server.matters.news/graphql",
  cache: new InMemoryCache()
});

const GRAB_ARTICLES = gql`
	query($userName: String!, $first: Int!) {
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

let userInfo = {
	userName: "",
	first: 20,
	dateStart: "",
	dateEnd: "",
};

function filterArticle(date) {
	let formatted = date.slice(0, 10);
	let start = userInfo.dateStart;
	let end = userInfo.dateEnd;

	if (start !== "" && end !== "") {
		return formatted >= start && formatted <= end ? "keep" : "throw";
	} else if (start !== "") {
		return formatted >= start ? "keep" : "throw";
	} else if (end !== "") {
		return formatted <= end ? "keep" : "throw";
	} else {
		return "keep";
	}
}

function Articles() {
	const userName = userInfo.userName;
	const first = parseInt(userInfo.first);
	const { loading, error, data } = useQuery(GRAB_ARTICLES, {
		variables: { userName, first },
	});

	if (loading) return <p>抓取中...</p>;
  if (error) return <p>啊！程序出错了</p>;
  if (data.user == null ||data.user.articles.edges.length === 0) return <p>什么都没抓到呢 ~</p>;

	return data.user.articles.edges.map((article, index) => (
		<div key={index}>
			<p className="result_article">
				<a className={filterArticle(article.node.createdAt)} href={`https://matters.news/@${userName}/${article.node.slug}-${article.node.mediaHash}`}>
					{article.node.title}
				</a>
			</p>
		</div>
	));
}

class Result extends React.Component {
	render() {
		return (
			<div className="result_articles">
				<Articles />
			</div>
		);
	}
}

class Grab extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			...userInfo,
		};

		this.handleInput = this.handleInput.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleInput(event) {
		const target = event.target;
		this.setState({
			[target.name]: target.value,
		});
	}

	handleSubmit(event) {
		this.props.setFill();
		userInfo = this.state;
		event.preventDefault();
	}

	render() {
		return (
			<form onSubmit={this.handleSubmit}>
				<div className="grab_row">
					<label>
						用户名
						<input type="text" name="userName" onChange={this.handleInput} value={this.state.userName} required />
					</label>
				</div>

				<div className="grab_row">
					<label>
						文章数量
						<input type="number" name="first" onChange={this.handleInput} value={this.state.first} />
					</label>
				</div>
				<div className="grab_row">
					<label>
						从
						<input type="date" name="dateStart" onChange={this.handleInput} value={this.state.dateStart} />
					</label>
					<label>
						到
						<input type="date" name="dateEnd" onChange={this.handleInput} value={this.state.dateEnd} />
					</label>
				</div>
				<input type="submit" value="🥔抓!" className="grab_btn" />
			</form>
		);
	}
}

function Content(props) {
	if (props.filled) {
		return <Result />;
	} else {
		return <Grab setFill={props.setFill} />;
	}
}

class Matalogue extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			filled: false,
		};

		this.setFill = this.setFill.bind(this);
	}

	setFill() {
		this.setState({ filled: true });
	}

	render() {
		return (
			<ApolloProvider client={client}>
				<div className="matalogue">
					<header>
						<h1>Matalogue</h1>
					</header>
					<div className="content">
						<Content filled={this.state.filled} setFill={this.setFill} />
					</div>
					<footer>
						<button>
							<a href="https://matters.news/@tofuming" target="_blank">
								<span role="img" aria-label="emoji">
									🥕
								</span>
								豆腐制作
							</a>
						</button>
						<button>
							<a href="https://www.tofumind.space/matalogue%e7%9a%84%e4%bd%bf%e7%94%a8%e6%89%8b%e5%86%8c/" target="_blank">
								<span role="img" aria-label="emoji">
									🧄
								</span>
								使用方法
							</a>
						</button>
					</footer>
				</div>
			</ApolloProvider>
		);
	}
}
ReactDOM.render(<Matalogue />, document.getElementById("root"));
