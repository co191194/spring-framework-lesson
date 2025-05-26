# **5.DIとは？**

３章で説明した通りSpring FrameworkにおいてDIはを中心に設計されています。
本章では、DIについて詳しく説明します。

## **DIの概要**

DIはオブジェクト指向プログラミングでよく使われる設計手法の一つです。
簡単に説明すると「必要な部品(依存するオブジェクト)を自分で作らず、外からもらう仕組み」です。

カフェを例にあげると...

- 店員(サービス)が「コーヒー豆」を自分で選んで仕入れるのではなく、
  店長に仕入れてもらう(注入してもらう:injection)イメージです。

## **なぜDIが必要なのか？**

1. 柔軟でテストしやすいコードになる
   - 依存している部品を外から差し替えられるので、テスト用のダミー部品に切り替えることが簡単です。
1. 部品の交換が簡単になる
   - 例えば「コーヒー豆」を「紅茶の茶葉」に変更するときも、注入するものを変えるだけで済みます。
1. コードの再利用性が高まる
   - 汎用的な部品として設計できるので、同じ部品を他の場所でも使いやすくなります。

## **SpringにおけるDIの具体例**

DIを使わない場合と使う場合での例を記載します。

### **DIを使わない書き方(従来の書き方)**

```java
public class OrderRepository {
  // 省略
}

public class OrderService {

  // 自分でインスタンスを生成
  private OrderRepository orderRepository = new OrderRepository();
}

```

- 依存する部品(OrderRepository)を自分で作ります。

### **DIを使った書き方(Springの場合)**

```java
public interface OrderRepository {
  // 省略
}

@Repository
public class OrderRepositoryImpl implements OrderRepository {
  // 省略
}

@Service
public class OrderService {

  private final OrderRepository orderRepository;

  // コンストラクタで外部から注入
  public OrderService(OrderRepository orderRepository) {
    this.orderRepository = orderRepository; // OrderRepositoryImplが注入される。
  }

}

```

- 必要な部品(OrderRepository)を外から受け取っています。
- Spring Frameworkが自動でコンストラクタを実行し、OrderRepositoryを注入してくれます。

## **なぜDIでテストがしやすくなるのか？**

### **依存する部品を自由に差し替えられる**

DIを使うとクラスが直接依存するオブジェクトを「外から注入」する構造になります。  
これにより、テスト時には「本物」の部品の代わりに「テスト用のダミー(モック)」を渡すことができます。

例：ユーザ情報を取得するサービス

DIを使わない場合

```java
public class UserRepository {
  // 省略
}


public class UserService {
    private UserRepository userRepository = new UserRepository();

    public User getUser(String id) {
        return userRepository.findById(id);
    }
}
```

この場合、UserRepositoryが必ず本物でないといけないのでテスト時にデータベース接続が必要になってしまいます。

DIを使う場合

```java
public interface UserRepository {
  // 省略
}

// 本物の実装クラス
@Repository
public class UserRepositoryImpl implements UserRepository {
  // 省略
}

// テスト用のダミークラス(モック)
public class TestUserRepositoryImpl implements UserRepository {
  @Override
  public User findById(String id) {
    // ダミーの結果を返す
    return new User(id, "テストユーザ");
  }
}


@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUser(String id) {
        return userRepository.findById(id);
    }
}
```

この場合、次のようにテストコードで「テスト用のUserRepository(モック)」を渡すことができます。

```java
UserService userService = new UserService(new TestUserRepositoryImpl());
User user = userService.getUser("123");
assertEquals("テストユーザ", user.getName());
```

1. 本物のデータベースに依存しない
1. ダミーデータを直接使うため、データの準備が不要になり早く・安定したテストができる
1. データベースを変更しておらず、テスト用のコードを使用しているため、想定外の副作用が発生しにくい

### **ユニットテストが簡単になる**

- 依存する外部サービスやDBの状態に左右されず、テストしたいクラス単体の動作をチェックすることができる。
- テストケースごとに異なる振る舞いのモックを渡すことで、いろいろなパターンのテストが容易にできる。

## **SpringにおけるDIの仕組み**

Springは「IoCコンテナ」(Inversion of Control Container)という仕組みを持っています。  
このコンテナがアプリ部品(Bean)を生成・管理し、必要な時に自動で依存関係を注入してくれます。

:::tip

- Bean(ビーン) : Springが生成・管理するオブジェクトのこと。
- IoCコンテナ : Beanの生成や依存関係の解決を担当するSpringの中核部分。
  :::

### **DIの方法(注入の種類)**

SpringではDIの方法として３つの方法があります。

1. コンストラクタインジェクション(推奨)

   - 依存するオブジェクトをコンストラクタの引数で受け取る方法。

     ```java
     @Component
     public class UserService {
       private final UserRepository userRepository;

       @Autowired // Spring Boot 2.0以降は省略可能
       public UserService(UserRepository userRepository) {
         this.userRepository = userRepository;
       }
     }
     ```

     - `@Component` : このクラスをSpring管理下でのBeanにする。@Componentの他に＠Controller/@Service/@Repositoryなどがあります。
     - `@Autowired` : Springに依存関係を注入してもらいます。

1. フィールドインジェクション
   - フィールド(メンバ変数)に直接注入する方法。
     ```java
     @Component
     public class UserService {
       @Autowired
       private final UserRepository userRepository;
     }
     ```
     - 手軽ですが、テストや拡張性の観点からコンストラクタインジェクションが推奨されています。
1. セッターインジェクション

   - セッターメソッドを使って注入する方法。

     ```java
     @Component
     public class UserService {
       private final UserRepository userRepository;

       @Autowired
       public void setUserRepository(UserRepository userRepository) {
         this.userRepository = userRepository;
       }
     }
     ```

### **Beanの登録方法**

SpringではBeanの登録方法として２つの方法があります。

1. アノテーションでの自動登録(コンポーネントスキャン)
   - `@Component`, `@Service`, `@Repository`, `@Controller`などをクラスにつけると自動的にBean登録されます。
1. JavaConfigによる定義
   ```java
   @Configuration
   public class AppConfig {
     @Bean
     public UserService userService(UserRepository userRepository) {
       return new UserService(userRepository);
     }
   }
   ```

### **依存解決の流れ**

1. Springアプリ起動時にIoCコンテナが全てのBeanを生成。
1. 依存関係を解決し、必要なBean同志を組み合わせてインスタンスを生成。
1. 開発者は依存先オブジェクトをnewせず、注入の指定をすればOK。