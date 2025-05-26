# **7.トランザクション管理**

## **トランザクションとは**

トランザクションとは、データベースなどで「一覧の処理をひとつのまとまり(単位)」として扱う仕組みです。
例えば銀行の送金処理で「Aさんからお金を引き落とし、Bさんに振り込む」という２つの処理が両方とも成功する、
または両方とも失敗する、というように「全部成功か、全部失敗か」を保証するものです。

### **トランザクションの4つの性質(ACID特性)**

1. **Atomicity(原子性)**  
   すべての操作が完全に実行されるか、全く実行されないかのどちらか。
1. **Consistency(一貫性)**  
   トランザクション実行前後でデータの整合性が保たれる。
1. **Isolation(独立性/分離性)**
   複数のトランザクションが同時に実行されても互いに干渉しない。
1. **Durability(永続性)**
   完了したトランザクションの結果は失われない。

## **Springのトランザクション管理とは？**

Spring Frameworkは、Javaアプリケーションを作る時に「トランザクション管理」を
簡単にできる仕組みを用意しています。

### **主な特徴**

- **宣言的トランザクション管理**  
   アノテーション(例: `@Transactional`)やXML設定で、トランザクションの開始・終了を自動化できます。
- **プログラム的トランザクション管理**  
   Javaのコードで自分でトランザクションの開始や終了を制御することもできます。

### **Springのトランサクション管理の利点**

- 複雑なトランザクション制御を簡単な記述で実現できる。
- データの整合性を担保しやすい。
- データベースや環境を意識せずに利用できる。

### **アノテーションでの管理(おすすめ)**

最も簡単なのは、**アノテーションでの管理**です。
クラス単位・メソッド単位で管理することも可能です。
なお、アノテーションでの管理は宣言的トランザクション管理の一種です。

#### **特徴**

- `@Transactional`をメソッドやクラスにつけるだけで、その中の処理が「ひとつのトランザクション」として扱われます。
- 途中で例外(エラー)が発生した場合、自動的にロールバックされ、データの不整合が起きません。

#### **メソッド単位での@Transactional**

```java title="UserService.java" {7,14}
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void createUser(User user) {
        // ここからトランザクション開始
        userRepository.save(user);
        // ここまでがトランザクションの範囲
    }

    @Transactional
    public void updateUserEmail(Long userId, String newEmail) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setEmail(newEmail);
        // 変更はトランザクションがコミットされるときにDBに反映
    }
}
```

- `@Transactional`をメソッドにつけると、そのメソッドの処理全体が１つのトランザクションで実行されます。
- 途中で例外が発生した場合、自動的にロールバックされます。

#### **クラス単位での@Transactional**

```java title="OrderService.java" {2}
@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public void createOrder(Order order) {
        orderRepository.save(order);
        // ここもトランザクションの範囲
    }

    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus("CANCELLED");
    }
}
```

- クラスに`＠Transactional`をつけると、そのクラス内の**すべてのパブリックメソッド**がトランザクション管理されます。
- ただし、privateメソッドや同じクラス内からのメソッド呼び出しには適用されないので注意してください。

#### **@Transactionalの属性例(応用)**

##### **読み取り専用トランザクション**

```java {1}
@Transactional(readOnly = true)
public List<User> getAllUsers() {
    return userRepository.findAll();
}
```

- `readOnly = true`を指定すると、読み取り専用の最適化が働きます(書き込みがない場合に推奨)。


##### **ロールバック条件の指定**

```java {1}
@Transactional(rollbackFor = CustomException.class)
public void doSomething() throws CustomException {
    // CustomExceptionが発生した場合だけロールバック
}
```

- `rollbackFor`で、どの例外が発生したらロールバックするかを指定できます。
