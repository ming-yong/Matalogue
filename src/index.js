import React from "react";
import ReactDOM from "react-dom";
import "./style.css";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { gql } from "@apollo/client";

const client = new ApolloClient({
	uri: "https://server.matters.news/graphql",
	cache: new InMemoryCache(),
});

client
	.query({
		query: gql`
			query {
				user(input: { userName: "tofuming" }) {
					articles(input: {}) {
						edges {
							node {
								title
								slug
								mediaHash
							}
						}
					}
				}
			}
		`,
	})
	.then((result) => console.log(result));

class Matalogue extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			step: 1,
			userName: "",
			articleAmount: 100,
			dateStart: "",
			dateEnd: "",
		};

		this.submitInfo = this.submitInfo.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.resetAll = this.resetAll.bind(this);
	}

	handleChange(event) {
		const target = event.target;
		this.setState({
			[target.name]: target.value,
		});
	}

	submitInfo(event) {
		alert(this.state.articleAmount);
		if (this.state.userName !== "") {
			this.setState({ step: 2 });
		}
		event.preventDefault();
	}

	resetAll(event) {
		this.setState({ step: 1 });
	}

	render() {
		return (
			<div className="App">
				<header>
					<h1>Matalogue</h1>
				</header>
				<Form step={this.state.step} userName={this.state.userName} dateStart={this.state.dateStart} dateEnd={this.state.dateEnd} articleAmount={this.state.articleAmount} submitInfo={this.submitInfo} handleChange={this.handleChange} />
				<footer className="footer">
					<button>
						<a href="#" className="credit">
							🥕豆腐制作
						</a>
					</button>
					<button onClick={this.resetAll}>🧄重来</button>
				</footer>
			</div>
		);
	}
}

function Form(props) {
	switch (props.step) {
		case 2:
			return <Result />;
		default:
			return <GrabFrom userName={props.userName} articleAmount={props.articleAmount} dateStart={props.dateStart} dateEnd={props.dateEnd} submitInfo={props.submitInfo} handleChange={props.handleChange} />;
	}
}

function GrabFrom(props) {
	return (
		<form onSubmit={props.submitInfo}>
			<div className="row">
				<label>
					用户名
					<input type="text" name="userName" onChange={props.handleChange} value={props.userName} />
				</label>
			</div>

			<div className="row">
				<label>
					文章数量
					<input type="number" name="articleAmount" onChange={props.handleChange} value={props.articleAmount} />
				</label>
			</div>

			<div className="row">
				<label>
					从
					<input type="date" name="dateStart" onChange={props.handleChange} value={props.dateStart} />
				</label>
				<label>
					到
					<input type="date" name="dateEnd" onChange={props.handleChange} value={props.dateEnd} />
				</label>
			</div>

			<div className="row">
				<input type="submit" value="抓！" className="btn" />
			</div>
		</form>
	);
}

function Result(props) {
	return (
		<ApolloProvider client={client}>
			<div>
				<h2>My first Apollo app 🚀</h2>
			</div>
		</ApolloProvider>
	);
}

ReactDOM.render(<Matalogue />, document.getElementById("root"));
