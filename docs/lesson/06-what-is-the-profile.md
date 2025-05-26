# **6.プロファイル-環境ごとに設定を切り替える仕組み**

Springにはアプリケーションの設定やBeanを実行ごとに切り替えるために「プロファイル」という仕組みがあります。

具体的には、

- 開発用
- 本番用
- テスト用

など、**環境ごとに設定を変えたい**ときに使います。

例えば...

- 開発用では「ローカルデータベース」を使いたい。
- 本番環境用ではAWSやAzure上の「本番データベース」を使いたい。
- テストでは「ダミーデータ」を使いたい。

といった場合、プロファイルを使うことで**同じコードなのに設定だけを切り替える**ことができます。

## **使い方**

### **プロファイルごとの設定ファイルを作成**

Spring Bootを利用する場合、`src/main/resources`ディレクトリに設定ファイルを用意します。

```text
application.properties      ← 全プロファイル用共通の設定
application-dev.properties  ← devプロファイル用
application-prod.properties ← prodプロファイル用
```

例えば、データベースの設置をプロファイルごとに分けたいときは以下のように記載します。

```properties title="application-dev.properties"
spring.datasource.url=jdbc:h2:mem:devdb
spring.datasource.username=devuser
spring.datasource.password=devpass
```

```properties title="application-prod.properties"
spring.datasource.url=jdbc:mysql://prod-server/db
spring.datasource.username=produser
spring.datasource.password=prodpass
```

### **Beanのプロファイルによる切り替え**

Javaのクラスで、`@Profile`を使うことでBeanごとに使用するプロファイルを設定することができます。

```java {5,11} title="DataSourceConfig.java"
@Configuration
public class DataSourceConfig {

    @Bean
    @Profile("dev")
    public DataSource devDataSource() {
        // 開発用データソースを返す
    }

    @Bean
    @Profile("prod")
    public DataSource prodDataSource() {
        // 本番用データソースを返す
    }
}
```

このようにConfigクラスを実装することで、**有効なプロファイルに応じて**Beanが切り替わります。

### **プロファイルの指定方法**

アプリが起動時に使用するプロファイルを指定する方法は３つあります。

1. アプリ起動時にコマンドラインで指定  
   ビルドしたアプリを起動する際に以下のようにオプションを指定することでプロファイルを指定することができます。
   ```bash
   java -jar app.jar --spring.profiles.active=dev
   ```
1. 環境変数で指定  
   環境変数`SPRING_PROFILES_ACTIVE`を設定することでアプリ起動時のプロファイルを指定することができます。
   ```bash
   export SPRING_PROFILES_ACTIVE=prod
   ```
1. application.propertiesで指定  
   共通プロファイルであるapplication.propertiesで指定することもできます。
   ```properties title="application.properties"
   spring.profiles.active=dev
   ```
   ::: warning
   ただし、外部指定(コマンドラインや環境変数での指定)の方が優先されます。
   :::

### **複数プロファイルの有効化**

プロファイルはカンマ区切りで複数指定することができます。

```bash
java -jar app.jar --spring.profiles.active=dev,local
```

## **propertiesファイル以外での記載方法**

プロファイルはpropertiesファイル以外でも記載することができます。

### **YAML形式での記載**

プロファイルの記述ファイルとしてYAMLファイルを使用することができます。  
Spring Bootでは、`application.yml/application.yaml`ファイルを使ってプロファイルごとの設定を書くことがよくあります。  
YAMLは階層構造を表現しやすく、複雑な設定にも向いています。

```yaml :collapsed-lines=5 title="application.yml"
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/common_db
    username: commonuser
    password: commonpass
---
spring:
  config:
    activate:
      on-profile: dev
  datasource:
    url: jdbc:h2:mem:devdb
    username: devuser
    password: devpass
---
spring:
  config:
    activate:
      on-profile: prod
  datasource:
    url: jdbc:mysql://prod-server/db
    username: produser
    password: prodpass
```

上記のように、`---`で区切ることで１つのファイルに複数のプロファイルの設定を記述することができます。

### **Java Configクラスでの記載**

Javaのクラスに`@Configuration`と`@Profile`アノテーションを使い、直接Beanを定義することもできます。

```java {1-2} title="DevDataSource.java"
@Configuration
@Profile("dev")
public class DevDataSourceConfig {
    @Bean
    public DataSource dataSource() {
        // 開発用データソースの設定
    }
}
```

メソッド単位で適用するプロファイルを指定することもできます。

```java {5,11} title="DataSourceConfig.java"
@Configuration
public class DataSourceConfig {

    @Bean
    @Profile("dev")
    public DataSource devDataSource() {
        // 開発用データソースを返す
    }

    @Bean
    @Profile("prod")
    public DataSource prodDataSource() {
        // 本番用データソースを返す
    }
}
```

### **外部設定(環境変数やコマンドライン引数)**

YAMLやproperties意外にも、環境変数やコマンドライン引数からプロファイル固有の設定を直接渡すこともできます。

## **ビルドツールから起動する場合**

MavenやGradleといったビルドツールからアプリを起動する際にもプロファイルを指定することができます。

### **Mavenの場合**

`spring-boot:run`コマンドに`-Dspring-boot.run.profiles`オプションをつけてプロファイルを指定できます。

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### **Gradleの場合**

`bootRun`タスクの`--args`オプション、または、`-Dspring.profiles.active`を使ってプロファイルを指定できます。

#### `--args`を使う方法(推奨)

```bash
./gradlew bootRun --args='--spring.profiles.active=dev'
```

#### `-Dspring.profiles.active`を使う方法

```bash
./gradlew bootRun -Dspring.profiles.active=dev
```

どちらの方法でもプロファイルを指定できますが、`--args`の方法がより一般的です。

## **動的に設定値を変更する**

Spring Bootでは**環境変数**を利用することで`application.properties`や`application.yml`の設定値を動的に変更することが可能です。

### **書き方**

設定ファイル内で`${環境変数}`と書くことで、環境変数やJVMシステムプロパティの値を参照できます。

```properties title="application.properties"
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASS}
```

```yaml title="application.yml"
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USER}
    password: ${DB_PASS}
```

また、`${環境変数:デフォルト値}`のように書くことで、環境変数が未設定の場合にデフォルト値が適用されます。

```yaml title="application.yml"
spring:
  datasource:
    # 環境変数DB_URLが設定されていない場合はjdbc:h2:mem:testdbを設定する
    url: ${DB_URL:jdbc:h2:mem:testdb}
```

### **環境変数を利用するメリット**

環境変数を利用する場合、設定ファイルの編集や作成をすることなく、
開発者ごとやサーバごとに異なる設定を適用することが可能です。

そのため、一時的に設定ファイルを変更して作業を行ったあと、
誤って変更した設定ファイルをGitのリモートリポジトリにプッシュしてしまうといった
ミスが発生しなくなります。

また、パスワードやハッシュのシークレットキーなどのセキュリティ情報を
設定ファイルから隠蔽できるため、ソースの流出などが発生した場合であっても
セキュリティ情報が流出する心配がなくなります。

### **上書きの優先順**

Spring Bootでは  
**コマンドライン引数＞環境変数＞application.yml/properties**  
の順で設定を上書きします。