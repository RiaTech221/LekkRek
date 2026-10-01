import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class FixEnum {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:mysql://localhost:3306/lekkrek_db";
        String user = "root";
        String password = "";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            stmt.executeUpdate("ALTER TABLE utilisateurs MODIFY role VARCHAR(50) NOT NULL;");
            System.out.println("Column role successfully changed to VARCHAR(50).");
        }
    }
}
