# **9. Spring Security**

## 目的

Spring Securityは、Springアプリケーションに認証や認可などのセキュリティ機能を追加するためのフレームワークです。Webアプリケーションの安全性を高めるために利用されます。

---

## 1. Spring Securityとは？

Spring Securityは、ユーザー認証（ログイン）やアクセス制御（権限管理）を簡単に実装できるSpringの拡張ライブラリです。
主な機能は以下の通りです。

- ユーザー認証（ログイン・ログアウト）
- 権限によるアクセス制御
- パスワードの暗号化
- CSRF対策
- CORS

---

## 2. Spring Securityの導入

### 依存関係の追加（Mavenの場合）

```xml
<!-- pom.xmlに追加 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

---

## 3. 最も簡単なSpring Securityの設定

Spring Securityを導入すると、デフォルトで全てのURLが認証を要求されます。
初期状態では、`user`というユーザー名と、起動時にコンソールに表示されるパスワードでログインできます。

---


## 4. 独自の認証設定

独自のユーザー名・パスワードを設定するには、`SecurityConfig`クラスを作成します。

```java
// filepath: src/main/java/com/example/demo/config/SecurityConfig.java
package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .anyRequest().authenticated()
            )
            .formLogin(); // ログインフォームを有効化
        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        // メモリ上にユーザー情報を登録
        return new InMemoryUserDetailsManager(
            User.withUsername("user")
                .password("{noop}password") // {noop}はパスワードの暗号化なし
                .roles("USER")
                .build()
        );
    }
}
```

---

## 4-1. 権限によるアクセス制御

Spring Securityでは、ユーザーの権限（ロール）に応じてアクセスできるURLを制限できます。
例えば、管理者だけがアクセスできるページを作る場合は、以下のように設定します。

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .antMatchers("/admin/**").hasRole("ADMIN") // /admin配下はADMINロールのみ
            .anyRequest().authenticated()
        )
        .formLogin();
    return http.build();
}

@Bean
public UserDetailsService userDetailsService() {
    return new InMemoryUserDetailsManager(
        User.withUsername("user")
            .password("{noop}password")
            .roles("USER")
            .build(),
        User.withUsername("admin")
            .password("{noop}adminpass")
            .roles("ADMIN")
            .build()
    );
}
```


このように、`hasRole("ADMIN")`を使うことで、特定のロールを持つユーザーだけがアクセスできるようになります。

---

## 4-2. パスワードの暗号化


Spring Securityでは、パスワードを安全に管理するために暗号化（ハッシュ化）することが推奨されています。

ハッシュ化とは、元のパスワードから一方向で変換された値（ハッシュ値）を保存する方法です。ハッシュ化されたパスワードは元に戻すことができないため、万が一データが漏洩しても安全性が高まります。

実際の運用では、`{noop}`（暗号化なし）ではなく、`BCryptPasswordEncoder`などを使ってパスワードをハッシュ化します。

以下はBCryptによるパスワード暗号化の例です。

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

@Bean
public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {
    return new InMemoryUserDetailsManager(
        User.withUsername("user")
            .password(passwordEncoder.encode("password"))
            .roles("USER")
            .build(),
        User.withUsername("admin")
            .password(passwordEncoder.encode("adminpass"))
            .roles("ADMIN")
            .build()
    );
}
```


このように、`passwordEncoder.encode("パスワード")`でハッシュ化されたパスワードを登録できます。
BCryptは安全性が高く、Spring Securityで推奨される方式です。

---

## 4-3. CSRF対策

Spring Securityは、Webアプリケーションのセキュリティを高めるためにCSRF（クロスサイト・リクエスト・フォージェリ）対策が標準で有効になっています。

CSRFとは、悪意のあるサイトからユーザーの認証情報を使って不正なリクエストが送信される攻撃です。Spring Securityでは、フォーム送信時にCSRFトークンを自動で生成・検証することで、この攻撃を防ぎます。

通常は特別な設定をしなくてもCSRF対策が有効ですが、APIのみを提供する場合などは無効化することもできます。

### CSRF対策の無効化例

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf().disable() // CSRF対策を無効化
        .authorizeHttpRequests(auth -> auth
            .anyRequest().authenticated()
        )
        .formLogin();
    return http.build();
}
```


通常のWebアプリケーションではCSRF対策を有効にしておくことが推奨されます。

---

## 4-4. CORS（クロスオリジンリソースシェアリング）

CORSとは、異なるドメイン間でWebブラウザがリソースをやり取りできるようにする仕組みです。APIサーバーとフロントエンドが別ドメインの場合、CORSの設定が必要になります。

Spring Securityでは、`http.cors()`を有効にすることでCORS対応ができます。

### CORSの有効化例

```java
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors() // CORSを有効化
        .and()
        .authorizeHttpRequests(auth -> auth
            .anyRequest().authenticated()
        )
        .formLogin();
    return http.build();
}

@Bean
public CorsFilter corsFilter() {
    CorsConfiguration config = new CorsConfiguration();
    config.addAllowedOrigin("*"); // すべてのオリジンを許可（必要に応じて制限）
    config.addAllowedMethod("*"); // すべてのHTTPメソッドを許可
    config.addAllowedHeader("*"); // すべてのヘッダーを許可

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return new CorsFilter(source);
}
```

本番環境では、許可するオリジンやメソッドを必要なものだけに制限しましょう。

---

## 5. 認証画面の表示

Spring Securityを導入すると、`/login`ページが自動生成されます。
ブラウザでアクセスすると、ログイン画面が表示されます。

---

## 6. まとめ

Spring Securityは、少ない設定で強力なセキュリティ機能を追加できます。
まずはデフォルト設定から始め、必要に応じて独自の認証・認可設定を追加してみましょう。

---