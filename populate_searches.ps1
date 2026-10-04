$queries = @("Thieboudienne", "Yassa Poulet", "Pizza Margherita", "Burger Maison", "Chawarma", "Fataya", "Jus de Bissap")
$weights = @(25, 18, 12, 9, 7, 5, 3)

for ($i = 0; $i -lt $queries.Length; $i++) {
    for ($j = 0; $j -lt $weights[$i]; $j++) {
        $body = @{
            eventType = "search"
            entityId = $queries[$i]
            context = ""
        } | ConvertTo-Json
        
        Invoke-RestMethod -Uri "http://localhost:8080/api/v1/public/analytics" -Method Post -Body $body -ContentType "application/json"
    }
}
