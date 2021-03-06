import React from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
// import Promise from 'bluebird'
import Card from './CardSimular'
import Auth from '../../lib/Auth'
import Loading from '../common/Loading'
class Show extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      book: '',
      books: '',
      errors: '',
      data: ''
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleComment = this.handleComment.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleDeleteComments = this.handleDeleteComments.bind(this)
  }


  componentDidMount() {
    Promise.all([
      fetch(`/api/books/${this.props.match.params.id}`),
      fetch('/api/books/')
    ])
      .then(([res1, res2]) => Promise.all([res1.json(), res2.json()]))
      .then(([data1, data2]) => this.setState({
        book: data1,
        books: data2
      }))
  }


  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.componentDidMount()
    }
  }
  handleChange(e) {
    const data = { ...this.state.data, [e.target.name]: e.target.value }
    this.setState({ data })
    console.log(data)
  }
  handleComment(e) {
    e.preventDefault()
    const token = Auth.getToken()
    axios.post(`/api/books/${this.props.match.params.id}/comments`, this.state.data, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    window.location.reload()
  }
  handleDeleteComments(e) {
    const token = Auth.getToken()
    if (e.target.value === Auth.getPayload().sub) {
      axios.delete(`/api/books/${this.props.match.params.id}/comments/${e.target.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    }
    window.location.reload()
  }
  handleDelete() {
    const token = Auth.getToken()
    axios.delete(`/api/books/${this.props.match.params.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => this.props.history.push('/books'))
  }

  canModify() {
    return Auth.isAuthenticated() && Auth.getPayload().sub === this.state.book.createdBy._id
  }

  render() {
    if (!this.state.book) return <Loading />
    let similar = this.state.books.filter(book => book.genre === this.state.book.genre && book.title !== this.state.book.title)
    similar = similar.slice(0, 3)
    return (
      <section className="ShowOneBook">
        <div className="tile is-ancestor">
          <div className="tile is-vertical is-8">
            <div className="tile">
              <div className="tile is-parent is-vertical">
                <article id="ImgShowBook" className="tile is-child box">
                  <figure className="image is-2by3">
                    <img src={this.state.book.image} alt={this.state.book.title} />
                  </figure>
                  <div className="MainBookInfoShow">
                    <small className="text is-7 has-text-grey-light ">Release Year: {this.state.book.releaseYear} Genre: {this.state.book.genre} Pages: {this.state.book.pg}</small>
                    <p className="subtitle is-uppercase has-text-weight-bold">{this.state.book.title}</p>
                    <p className="title  is-6 is-size-6 ">{this.state.book.author}</p>
                  </div>
                </article>
              </div>
              <div className="tile is-parent">
                <article id="DescriptionShowBook" className="tile is-child box">
                  <p className="title">About the book</p><br />
                  <p className="text is-5">{this.state.book.description}</p>
                  <div>
                    <div className="buttons is-gapless is-thirdwidth">
                      {Auth.isAuthenticated() &&
                        <Link to={{
                          pathname: `/users/${Auth.getPayload().sub}`,
                          state: { book: this.state.book }
                        }}>
                          <button className="button is-dark">Add to Wish List</button>
                        </Link>
                      }
                      <a href={this.state.book.amazon} target="blank"> <button className="button is-dark">Buy on Amazon</button></a>
                      <a href={this.state.book.preview} > <button className="button is-dark">Preview</button></a>
                      {this.canModify() &&
                        <div className="level-right is-gapless edit2">
                          <Link to={`/books/${this.state.book._id}/edit`} className="button is-light e1">Edit</Link>
                          <button className="button is-light " onClick={this.handleDelete}>Delete</button>
                        </div>
                      }
                    </div>
                  </div>
                  <div className="show-content-comments subheading-show">
                    Comments
                  <article className="media">
                      <figure className="media-left">
                        <p className="image is-64x64">
                          {/* <img src="https://profile.actionsprout.com/default.jpeg" /> */}
                        </p>
                      </figure>
                      <div className="media-content">
                        <div className="field">
                          <p className="control">
                            <textarea className="textarea" name="content" placeholder="Add a comment..." onChange={this.handleChange}></textarea>
                          </p>
                        </div>
                        <nav className="level">
                          <div className="level-left">
                            <div className="level-item">
                              <a className="button is-dark" onClick={this.handleComment}>Post Comment</a>
                            </div>
                          </div>
                        </nav>
                      </div>
                    </article>
                    {this.state.book.comments.map(comment =>
                      <article key={comment._id} className="media">
                        <figure className="media-left">
                          <p className="image is-64x64">
                            <Link to={`/users/${comment.user.id}`}>
                              {comment.user.username}
                            </Link>
                          </p>
                        </figure>
                        <div className="media-content">
                          <div className="content">
                            <p className="commentText">
                              <strong>{comment.user.username}</strong> <small>{comment.createdAt.substring(0, comment.createdAt.length - 5).replace(/T/g, ' ')}</small>
                              <br />
                              {comment.content}
                            </p>
                          </div>
                          <nav className="level is-mobile">
                            <div className="level-left">
                              <a className="level-item">
                                <span className="icon is-small"><i className="fas fa-reply"></i></span>
                              </a>
                              <a className="level-item">
                                <span className="icon is-small"><i className="fas fa-retweet"></i></span>
                              </a>
                              <a className="level-item">
                                <span className="icon is-small"><i className="fas fa-heart"></i></span>
                              </a>
                            </div>
                          </nav>
                        </div>
                        <div className="media-right">
                          <button id={comment._id} value={comment.user._id} className="delete" onClick={this.handleDeleteComments}></button>
                        </div>
                      </article>
                    )}
                  </div>
                </article>
              </div>
            </div>
          </div>
          <div className="tile is-parent">
            <article id="" className="tile is-child box">
              <h2 className="title is-4 ">You might also like</h2>
              <div className="columns3">
                <div className=" simularbooksall">
                  {similar.map(book =>
                    <div className="similar-artist-image" key={book._id}>
                      <Link to={`/books/${book._id}`}>
                        <Card {...book} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              <div id="goodreads-widget" className="row is-two-fifths-desktop is-half-tablet is-full-mobile">
                <div className="title is-4">Goodreads reviews for {this.state.book.title}</div>
                <iframe id="the_iframe" src={`https://www.goodreads.com/api/reviews_widget_iframe?did=DEVELOPER_ID&format=html&header_text=Goodreads+reviews+for+${this.state.book.title}&isbn=${this.state.book.ISBN}&links=660&review_back=fff&stars=000&text=000`} width="565" height="400" frameBorder="0"></iframe>
              </div>
            </article>
          </div>
        </div >
      </section >
    )
  }
}
export default Show