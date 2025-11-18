# **8.RESTful Web API**

## **Web APIとは**

WebAPIとは、「Web Application Programming Interface」の略で、
**インターネットを通じて他のアプリケーションやサービスとデータをやりとりしたり
機能を利用するための仕組み**です。
WebAPIでは**HTTP通信**を行うことで他のアプリケーションやサービスと通信を行います。

## **利用シーン**

- スマホアプリやフロントエンド(ReactやVueなど)からデータを取得・登録したいとき。
- 他のサービス(天気予報やSNS、地図など)と連携したいとき。
- マイクロサービス同士でやりとりするとき。

:::tip

**マイクロサービス**とは、ソフトウェア開発の手法およびアーキテクチャの一種で、
一つのアプリケーションを複数の独立した小規模のコンポーネントに分割して構築する手法です。
:::

## **WebAPIの代表的な仕組み**

- URIごとに機能を分割(`/users`でユーザ一覧取得、`/orders`で注文情報取得など)
- HTTPメソッドで操作を分割(`GET`で取得、`POST`で登録、`PUT`で更新、`DELETE`で削除など)
- リクエストとレスポンスはJSON形式が主流
- 認証や認可が必要な場合も多い(トークンやAPIキーなど)

:::tip

**JSON形式**とは、「JavaScript Object Notation」の略で、
データを表現するための軽量なテキストベースのフォーマットのことです。
JavaScriptのオブジェクト構造を基としていますが、
様々なプログラミング言語で利用され、特にWebアプリでサーバとクライアント間の
データ交換に広く採用されています。

```json title="sample.json"
{
  "name": "田中太郎",
  "age": 24,
  "isStudent": false
}
```

:::

## **RESTful API**

**RESTful API**とは「REST(Representational State Transfer)」という設計原則に準拠して作成されたWebAPIのことです。

**REST**はWebの設計思想のひとつで、Webの持つ本来の仕組み（HTTPのGET, POST, PUT, DELETEなどのメソッドやURI、ステータスコードなど）を活用して、
シンプルで拡張性・可用性の高い分散システムを設計するための指針です。

## **RESTful APIの特徴**

1. リソース指向
   - たとえば、「ユーザ情報」は`/users`、「注文」は`/orders`のように「名詞」で表現するURIを設計します。
1. HTTPメソッドの意味を活用
   - `GET /users` ... ユーザ一覧の取得
   - `POST /users` ... 新規ユーザの登録
   - `GET /users/1` ... ID=1のユーザ情報の取得
   - `PUT /users/1` ... ID=1のユーザ情報の更新
   - `DELETE /users/1`... ID=1のユーザ情報の削除
1. ステートレス
   - 各リクエストは独立し、サーバはリクエストごとの情報のみで処理を行います。
1. 一貫したレスポンス形式
   - 多くの場合、JSONやXMLでデータを返します。

## **Springでの実装例**

SpringではWebAPIを作るためのコンポーネントを提供しています。(Spring MVCやSpring Boot)

```java
@RestController
@RequestMapping("/users")
public class UserController {

    // GET /users
    @GetMapping
    public List<User> getAllUsers() { ... }

    // POST /users
    @PostMapping
    public User createUser(@RequestBody User user) { ... }

    // GET /users/{id}
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) { ... }

    // PUT /users/{id}
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) { ... }

    // DELETE /users/{id}
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) { ... }
}
```

- `@RestController`: WebAPI用コントローラー向けのステレオタイプアノテーション
- `@RequestBody`: JSONリクエストをJavaオブジェクトに変換するアノテーション
- `@PathVariable`: URIに含まれるパスパラメータをJavaで扱えるように変換するアノテーション

## **まとめ**

- WebAPIは外部とデータや機能をやりとりするための"窓口"のこと。
- RESTful APIは「リソースをURIで表し、HTTPメソッドで操作」するWebAPIのこと。
- Spring MVCやSpring Bootを利用することで簡単にWebAPIを作ることができる。